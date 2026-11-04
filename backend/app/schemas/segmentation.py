from __future__ import annotations

import base64
import io
from typing import Any, List, Optional

from PIL import Image
from pydantic import BaseModel, Field, field_validator

from app.config import get_settings

ALLOWED_IMAGE_FORMATS = {'PNG', 'JPEG'}


class PromptPoint(BaseModel):
    x: float = Field(..., ge=0, le=1)
    y: float = Field(..., ge=0, le=1)


class BoundingBox(BaseModel):
    x: float = Field(..., ge=0, le=1)
    y: float = Field(..., ge=0, le=1)
    width: float = Field(..., gt=0, le=1)
    height: float = Field(..., gt=0, le=1)


class SegmentationRequest(BaseModel):
    image_base64: str
    text_prompt: str | None = None
    positive_points: List[PromptPoint] = Field(default_factory=list)
    negative_points: List[PromptPoint] = Field(default_factory=list)
    bounding_box: BoundingBox | None = None
    prompt_mode: str | None = None

    @field_validator('image_base64')
    @classmethod
    def validate_image_base64(cls, value: str) -> str:
        if not value or not isinstance(value, str):
            raise ValueError('image_base64 is required')

        encoded = value.split(',', 1)[-1] if ',' in value else value
        if not encoded:
            raise ValueError('image_base64 must contain an image payload')

        try:
            raw = base64.b64decode(encoded, validate=True)
        except Exception as exc:  # pragma: no cover - exercised via API validation
            raise ValueError('image_base64 must be valid base64') from exc

        settings = get_settings()
        if len(raw) > settings.max_upload_bytes:
            raise ValueError('image_base64 exceeds the configured upload size limit.')

        try:
            with Image.open(io.BytesIO(raw)) as image:
                image.verify()
            with Image.open(io.BytesIO(raw)) as image:
                if image.format not in ALLOWED_IMAGE_FORMATS:
                    raise ValueError('Only PNG and JPEG images are supported.')
                width, height = image.size
                if width * height > settings.max_image_pixels:
                    raise ValueError('Image exceeds the configured pixel limit.')
        except ValueError:
            raise
        except Exception as exc:  # pragma: no cover - exercised via API validation
            raise ValueError('image_base64 must decode to a valid image') from exc

        return value


class SegmentationResult(BaseModel):
    mask_data_url: Optional[str] = None
    pixel_area: Optional[int] = None
    processing_time_ms: Optional[int] = None
    confidence: Optional[float] = None
    region_label: Optional[str] = None
    status: str = 'success'
    message: str | None = None


class SegmentationError(BaseModel):
    detail: str


class MetaSAMResponse(BaseModel):
    output: Optional[list[Any]] = None
    error: Optional[str] = None
