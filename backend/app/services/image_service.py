from __future__ import annotations

from PIL import Image

from app.config import get_settings
from app.utils.image_processing import decode_base64_image


def validate_image(data_url: str) -> Image.Image:
    image = decode_base64_image(data_url)
    width, height = image.size
    if width <= 0 or height <= 0:
        raise ValueError('Image dimensions are invalid.')
    if width * height > get_settings().max_image_pixels:
        raise ValueError('Image exceeds the configured pixel limit.')
    return image
