from __future__ import annotations

import base64
import io
import logging
import time
from typing import Any

import numpy as np
from meta_sam_parser import (
    CompletedOutcome,
    FramePrompt,
    PromptBox,
    PromptObject,
    PromptPoint,
    build_object_prompt,
    decode_mask_to_raster,
    image_segmentation_format,
)
from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAI
from PIL import Image

from app.config import get_settings, require_model_api_key
from app.services.mask_service import mask_to_payload
from app.utils.image_processing import decode_base64_image

logger = logging.getLogger(__name__)


class SAMServiceError(RuntimeError):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code


def _extract_output_text(response: Any) -> str:
    output_text = getattr(response, 'output_text', None)
    if output_text:
        return output_text

    output = getattr(response, 'output', None) or []
    text_parts: list[str] = []

    def walk(node: Any) -> None:
        if isinstance(node, dict):
            if node.get('type') == 'output_text' and isinstance(node.get('text'), str):
                text_parts.append(node['text'])
                return
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)
        elif hasattr(node, 'model_dump'):
            walk(node.model_dump())

    walk(output)
    return ''.join(text_parts)


def _resize_binary_mask(mask: np.ndarray, height: int, width: int) -> np.ndarray:
    if mask.shape == (height, width):
        return (mask > 0).astype(np.uint8)
    image = Image.fromarray((mask > 0).astype(np.uint8) * 255)
    resized = image.resize((width, height), Image.Resampling.NEAREST)
    return (np.asarray(resized) > 0).astype(np.uint8)


def _extract_mask_from_parser(output_text: str) -> tuple[np.ndarray | None, float | None, str | None]:
    if not output_text or not output_text.strip():
        return None, None, None

    try:
        parser = image_segmentation_format().create_parser()
        parser.push(output_text)
        parsed = parser.finish(CompletedOutcome()).result
    except Exception as exc:
        raise SAMServiceError(502, 'Meta SAM returned a response that the official parser could not decode.') from exc

    records = getattr(parsed, 'records', ()) or ()
    mask_records = [
        record
        for record in records
        if getattr(record, 'kind', None) == 'mask' and getattr(record, 'mask', None) is not None
    ]
    if not mask_records:
        diagnostics = getattr(parsed, 'diagnostics', ()) or ()
        logger.warning(
            'Meta SAM output parsed without mask records (records=%d, kinds=%s, diagnostics=%s).',
            len(records),
            sorted({str(getattr(record, 'kind', type(record).__name__)) for record in records}),
            [str(getattr(diagnostic, 'code', 'unknown')) for diagnostic in diagnostics],
        )
        return None, None, None

    target_height = max(int(record.mask.height) for record in mask_records)
    target_width = max(int(record.mask.width) for record in mask_records)
    merged = np.zeros((target_height, target_width), dtype=np.uint8)
    confidences: list[float] = []
    labels: list[str] = []

    for record in mask_records:
        mask = record.mask
        raster = decode_mask_to_raster(mask)
        array = np.frombuffer(raster, dtype=np.uint8).reshape(int(mask.height), int(mask.width))
        merged |= _resize_binary_mask(array, target_height, target_width)

        confidence = getattr(record, 'confidence', None)
        if confidence is not None:
            confidences.append(float(confidence))

        label = str(getattr(record, 'object_id', '') or '').strip()
        if label and label not in labels:
            labels.append(label)

    return merged * 255, (max(confidences) if confidences else None), (','.join(labels) or None)


def _normalize_image_data_url(image_value: str | None) -> str:
    if not image_value:
        raise ValueError('Image payload is required for SAM inference.')
    if image_value.startswith('data:'):
        return image_value

    mime_subtype = 'png'
    try:
        raw = base64.b64decode(image_value, validate=True)
        with Image.open(io.BytesIO(raw)) as image:
            detected = (image.format or 'PNG').lower()
            if detected == 'jpeg':
                mime_subtype = 'jpeg'
            elif detected == 'png':
                mime_subtype = 'png'
    except Exception:
        mime_subtype = 'png'

    return f'data:image/{mime_subtype};base64,{image_value}'


def _point_prompt(point: dict[str, Any], width: int, height: int, label: str) -> PromptPoint:
    x = min(max(int(float(point.get('x', 0)) * width), 0), width - 1)
    y = min(max(int(float(point.get('y', 0)) * height), 0), height - 1)
    return PromptPoint(x=x, y=y, label=label)  # type: ignore[arg-type]


def _box_prompt(box: dict[str, Any], width: int, height: int) -> PromptBox:
    left = min(max(int(float(box.get('x', 0)) * width), 0), width - 1)
    top = min(max(int(float(box.get('y', 0)) * height), 0), height - 1)
    right = min(max(int((float(box.get('x', 0)) + float(box.get('width', 0))) * width), left + 1), width)
    bottom = min(max(int((float(box.get('y', 0)) + float(box.get('height', 0))) * height), top + 1), height)
    return PromptBox(left=left, top=top, right=right, bottom=bottom)


def _build_prompt_text(payload: dict[str, Any], width: int, height: int) -> str:
    text_prompt = str(payload.get('text_prompt') or '').strip()
    positive_points = payload.get('positive_points') or []
    negative_points = payload.get('negative_points') or []
    bounding_box = payload.get('bounding_box')

    if not (positive_points or negative_points or bounding_box):
        if not text_prompt:
            raise SAMServiceError(400, 'A text prompt or an object prompt is required.')
        return text_prompt

    if not positive_points and not bounding_box:
        raise SAMServiceError(400, 'At least one positive point or a bounding box is required.')

    try:
        frame_prompt = FramePrompt(
            frame=0,
            box=_box_prompt(bounding_box, width, height) if bounding_box else None,
            points=[
                *[_point_prompt(point, width, height, 'positive') for point in positive_points],
                *[_point_prompt(point, width, height, 'negative') for point in negative_points],
            ],
        )
        return build_object_prompt(
            size=(width, height),
            objects=[PromptObject(id=0, prompts=[frame_prompt])],
        )
    except SAMServiceError:
        raise
    except Exception as exc:
        raise SAMServiceError(400, 'The point or bounding-box prompt is invalid for this image.') from exc


def build_meta_request(payload: dict[str, Any], *, image_size: tuple[int, int]) -> dict[str, Any]:
    width, height = image_size
    prompt_text = _build_prompt_text(payload, width, height)
    raw_image_value = payload.get('image_url') or payload.get('image_base64')
    image_data = _normalize_image_data_url(raw_image_value)
    return {
        'model': 'sam-3.1',
        'input': [
            {
                'type': 'message',
                'role': 'user',
                'content': [
                    {'type': 'input_text', 'text': prompt_text},
                    {'type': 'input_image', 'image_url': image_data},
                ],
            }
        ],
        'metadata': {
            'mask_encoding': 'one_bit',
            'include_confidence': 'true',
        },
    }


def parse_meta_response(response: Any) -> tuple[np.ndarray | None, float | None, str | None]:
    output_text = _extract_output_text(response)
    if not output_text:
        logger.info('Meta SAM returned an empty output_text lane; treating it as zero matches.')
        return None, None, None
    return _extract_mask_from_parser(output_text)


def call_meta_sam(
    image_base64: str,
    *,
    text_prompt: str | None = None,
    positive_points: list[dict] | None = None,
    negative_points: list[dict] | None = None,
    bounding_box: dict | None = None,
) -> Any:
    settings = get_settings()
    api_key = require_model_api_key()

    image = decode_base64_image(image_base64)
    request = {
        'image_base64': image_base64,
        'text_prompt': text_prompt,
        'positive_points': positive_points or [],
        'negative_points': negative_points or [],
        'bounding_box': bounding_box,
    }
    payload = build_meta_request(request, image_size=image.size)

    client = OpenAI(
        api_key=api_key,
        base_url=settings.api_base_url,
        timeout=settings.request_timeout_seconds,
        max_retries=0,
    )
    try:
        return client.responses.create(
            model='sam-3.1',
            input=payload['input'],
            metadata=payload.get('metadata'),
        )
    except APITimeoutError as exc:
        raise SAMServiceError(504, 'Meta SAM did not respond before the request timeout.') from exc
    except APIConnectionError as exc:
        raise SAMServiceError(502, 'Could not reach the Meta SAM service.') from exc
    except APIStatusError as exc:
        status = exc.status_code
        if status == 429:
            message = 'Meta SAM rate limit reached. Please retry shortly.'
        elif status in (401, 403):
            message = 'Meta SAM rejected the configured API credentials.'
        elif 400 <= status < 500:
            message = 'Meta SAM rejected the segmentation request. Check the image and prompt.'
        else:
            message = 'Meta SAM returned a server error. Please retry.'
        raise SAMServiceError(status if status in (400, 429) else 502, message) from exc


def generate_mask(
    image_base64: str,
    *,
    text_prompt: str | None = None,
    positive_points: list[dict] | None = None,
    negative_points: list[dict] | None = None,
    bounding_box: dict | None = None,
) -> dict[str, Any]:
    started_at = time.time()
    try:
        response = call_meta_sam(
            image_base64=image_base64,
            text_prompt=text_prompt,
            positive_points=positive_points,
            negative_points=negative_points,
            bounding_box=bounding_box,
        )
    except RuntimeError:
        raise

    mask_value, confidence, region_label = parse_meta_response(response)
    if mask_value is None:
        return {
            'mask_data_url': None,
            'pixel_area': 0,
            'processing_time_ms': int((time.time() - started_at) * 1000),
            'confidence': confidence,
            'region_label': region_label,
            'status': 'empty-mask',
            'message': 'Meta SAM returned no mask for this prompt.',
        }

    image = decode_base64_image(image_base64)
    width, height = image.size
    normalized = mask_to_payload(mask_value, height, width)
    return {
        'mask_data_url': normalized['mask_data_url'],
        'pixel_area': normalized['pixel_area'],
        'processing_time_ms': int((time.time() - started_at) * 1000),
        'confidence': confidence,
        'region_label': region_label,
        'status': 'success',
        'message': 'Segmentation generated successfully.',
    }
