from __future__ import annotations

from typing import Any

import numpy as np
from PIL import Image

from app.utils.image_processing import ensure_mask_shape, mask_to_png_base64, safe_mask_value


def normalize_mask(mask: Any, height: int, width: int) -> np.ndarray:
    array = safe_mask_value(mask)
    if array.size == 0:
        return np.zeros((height, width), dtype=np.uint8)
    array = ensure_mask_shape(array, height, width)
    if array.shape != (height, width):
        image = Image.fromarray((array > 0).astype(np.uint8) * 255)
        array = np.array(image.resize((width, height), Image.Resampling.NEAREST))
    array = array.copy()
    array[array > 0] = 255
    return array.astype(np.uint8)


def mask_to_payload(mask: Any, height: int, width: int) -> dict:
    mask_array = normalize_mask(mask, height, width)
    mask_data_url = mask_to_png_base64(mask_array)
    pixel_area = int(np.count_nonzero(mask_array > 0))
    return {
        'mask_data_url': mask_data_url,
        'pixel_area': pixel_area,
        'mask_array': mask_array,
    }
