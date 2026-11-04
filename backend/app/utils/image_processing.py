from __future__ import annotations

import base64
import io
from typing import Any

import numpy as np
from PIL import Image


def decode_base64_image(data: str) -> Image.Image:
    if ',' in data:
        data = data.split(',')[-1]
    image_bytes = base64.b64decode(data)
    with Image.open(io.BytesIO(image_bytes)) as image:
        image.load()
        return image.convert('RGBA')


def ensure_mask_shape(mask: np.ndarray, height: int, width: int) -> np.ndarray:
    if mask.ndim == 2:
        array = mask.astype(np.uint8)
    elif mask.ndim == 3 and mask.shape[-1] in (1, 3, 4):
        array = mask[:, :, 0].astype(np.uint8)
    else:
        array = np.zeros((height, width), dtype=np.uint8)

    if array.shape != (height, width) and array.size == height * width:
        array = array.reshape(height, width)
    return array


def mask_to_png_base64(mask: np.ndarray) -> str:
    mask_uint8 = np.clip(mask, 0, 255).astype(np.uint8)
    img = Image.fromarray(mask_uint8)
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode('utf-8')


def safe_mask_value(value: Any) -> np.ndarray:
    if isinstance(value, np.ndarray):
        return value
    if isinstance(value, list):
        return np.array(value, dtype=np.uint8)
    if isinstance(value, str):
        return np.array([int(char) for char in value], dtype=np.uint8)
    return np.zeros((0, 0), dtype=np.uint8)
