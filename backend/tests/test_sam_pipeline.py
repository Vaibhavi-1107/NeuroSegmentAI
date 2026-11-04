from __future__ import annotations

import base64
from io import BytesIO

import httpx
import numpy as np
from meta_sam_parser._mask_codec import _encode_raster
from openai import OpenAI
from PIL import Image

import app.services.sam_service as sam_service
from app.services.mask_service import mask_to_payload, normalize_mask
from app.services.sam_service import (
    _extract_mask_from_parser,
    build_meta_request,
    generate_mask,
    parse_meta_response,
)


def _mock_response(output_text: str):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                'id': 'resp_test',
                'object': 'response',
                'created_at': 0,
                'status': 'completed',
                'model': 'sam-3.1',
                'output': [
                    {
                        'id': 'msg_test',
                        'type': 'message',
                        'status': 'completed',
                        'role': 'assistant',
                        'content': [
                            {
                                'type': 'output_text',
                                'text': output_text,
                                'annotations': [],
                            }
                        ],
                    }
                ],
                'parallel_tool_calls': False,
                'tool_choice': 'auto',
                'tools': [],
            },
        )

    client = OpenAI(
        api_key='test-key',
        base_url='http://test.local/v1',
        http_client=httpx.Client(transport=httpx.MockTransport(handler)),
    )
    return client.responses.create(model='sam-3.1', input=[])


def _png_data_url() -> str:
    image = Image.new('RGB', (4, 4), color=(0, 0, 0))
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode('ascii')


def _encoded_mask_output_text() -> str:
    raster = [
        0, 0, 0, 0,
        0, 1, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,
    ]
    encoded = _encode_raster(raster, 4, 4)
    return (
        '<0f>0<|box;x1=0;y1=0;x2=3;y2=3;w=4;h=4|>'
        f'<|mask;x=0;y=0;data=4,4,{encoded}|>'
    )


def test_build_meta_request_uses_official_object_prompt() -> None:
    request = build_meta_request(
        {
            'image_base64': 'image-data',
            'text_prompt': 'brain tumor',
            'positive_points': [{'x': 0.5, 'y': 0.5}],
            'negative_points': [{'x': 0.25, 'y': 0.25}],
            'bounding_box': None,
        },
        image_size=(32, 32),
    )

    message = request['input'][0]
    prompt_text = message['content'][0]['text']
    assert message['type'] == 'message'
    assert prompt_text == '<0f>0<|point;x=16;y=16;w=32;h=32|>-<|point;x=8;y=8;w=32;h=32|>'
    assert request['metadata'] == {'mask_encoding': 'one_bit', 'include_confidence': 'true'}


def test_build_meta_request_converts_bounding_box_to_pixels() -> None:
    request = build_meta_request(
        {
            'image_base64': 'image-data',
            'bounding_box': {'x': 0.25, 'y': 0.25, 'width': 0.5, 'height': 0.5},
        },
        image_size=(32, 32),
    )

    prompt_text = request['input'][0]['content'][0]['text']
    assert prompt_text == '<0f>0<|box;x1=8;y1=8;x2=23;y2=23;w=32;h=32|>'


def test_plain_text_prompt_is_unchanged() -> None:
    request = build_meta_request(
        {'image_base64': 'image-data', 'text_prompt': ' brain lesion '},
        image_size=(32, 32),
    )

    assert request['input'][0]['type'] == 'message'
    assert request['input'][0]['content'][0]['text'] == 'brain lesion'


def test_raw_jpeg_base64_uses_jpeg_mime_type() -> None:
    image = Image.new('RGB', (8, 8), color=(20, 30, 40))
    buffer = BytesIO()
    image.save(buffer, format='JPEG')
    raw_base64 = base64.b64encode(buffer.getvalue()).decode('ascii')

    request = build_meta_request(
        {'image_base64': raw_base64, 'text_prompt': 'brain'},
        image_size=(8, 8),
    )

    image_url = request['input'][0]['content'][1]['image_url']
    assert image_url.startswith('data:image/jpeg;base64,')


def test_normalize_mask_resizes_downsampled_mask_instead_of_zeroing_it() -> None:
    mask = np.zeros((4, 4), dtype=np.uint8)
    mask[1:3, 1:3] = 1

    result = normalize_mask(mask, 32, 32)

    assert result.shape == (32, 32)
    assert result.max() == 255
    assert int(np.count_nonzero(result)) > 0


def test_mask_to_payload_contains_png_and_pixel_area() -> None:
    mask = np.zeros((8, 8), dtype=np.uint8)
    mask[2:5, 2:5] = 1

    result = mask_to_payload(mask, 8, 8)

    assert result['mask_data_url'].startswith('data:image/png;base64,')
    assert result['pixel_area'] == 9


def test_official_parser_mask_is_decoded_without_api_call() -> None:
    mask, confidence, label = _extract_mask_from_parser(_encoded_mask_output_text())

    assert mask is not None
    assert mask.shape == (4, 4)
    assert int(np.count_nonzero(mask)) == 4
    assert confidence is None
    assert label == '0'


def test_sdk_response_text_is_parsed_into_mask() -> None:
    mask, confidence, label = parse_meta_response(_mock_response(_encoded_mask_output_text()))

    assert mask is not None
    assert mask.shape == (4, 4)
    assert int(np.count_nonzero(mask)) == 4
    assert confidence is None
    assert label == '0'


def test_sdk_response_empty_output_is_a_zero_match() -> None:
    assert parse_meta_response(_mock_response('')) == (None, None, None)


def test_sdk_response_text_without_mask_is_not_success() -> None:
    assert parse_meta_response(_mock_response('no mask records here')) == (None, None, None)


def test_generate_mask_reports_zero_match_without_mask(monkeypatch) -> None:
    monkeypatch.setattr(sam_service, 'call_meta_sam', lambda **_: _mock_response(''))

    result = generate_mask(_png_data_url(), text_prompt='brain lesion')

    assert result['status'] == 'empty-mask'
    assert result['mask_data_url'] is None
    assert result['pixel_area'] == 0


def test_generate_mask_normalizes_sdk_mask_to_image_size(monkeypatch) -> None:
    monkeypatch.setattr(
        sam_service,
        'call_meta_sam',
        lambda **_: _mock_response(_encoded_mask_output_text()),
    )

    result = generate_mask(_png_data_url(), text_prompt='brain lesion')

    assert result['status'] == 'success'
    assert result['mask_data_url'].startswith('data:image/png;base64,')
    assert result['pixel_area'] == 4
