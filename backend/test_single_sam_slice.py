from __future__ import annotations

import argparse
import base64
import json
from pathlib import Path

from app.services.sam_service import generate_mask


def _encode_image(image_path: str) -> str:
    data = Path(image_path).read_bytes()
    return 'data:image/png;base64,' + base64.b64encode(data).decode('utf-8')


def main() -> int:
    parser = argparse.ArgumentParser(description='Run one controlled Meta SAM 3.1 test against a single MRI slice.')
    parser.add_argument('image_path', type=str, help='Path to a single MRI slice image file.')
    parser.add_argument('--prompt', default='brain lesion', help='Short prompt for a single supported SAM segmentation request.')
    args = parser.parse_args()

    image_data_url = _encode_image(args.image_path)
    result = generate_mask(image_data_url, text_prompt=args.prompt)
    print(json.dumps({
        'status': result.get('status'),
        'message': result.get('message'),
        'region_label': result.get('region_label'),
        'confidence': result.get('confidence'),
        'pixel_area': result.get('pixel_area'),
        'processing_time_ms': result.get('processing_time_ms'),
        'mask_data_url_present': bool(result.get('mask_data_url')),
    }, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
