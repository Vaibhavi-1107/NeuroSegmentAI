from __future__ import annotations

import base64
from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


@pytest.fixture
def sample_image_base64() -> str:
    image = Image.new('RGB', (32, 32), color=(10, 20, 30))
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode('utf-8')


def test_health_endpoint() -> None:
    client = TestClient(app)
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_cors_allows_default_frontend_origin() -> None:
    client = TestClient(app)
    response = client.options(
        '/api/segment',
        headers={
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
        },
    )
    assert response.status_code == 200
    assert response.headers['access-control-allow-origin'] == 'http://localhost:5173'


def test_segment_requires_valid_image(sample_image_base64: str) -> None:
    client = TestClient(app)
    response = client.post('/api/segment', json={'image_base64': 'invalid'})
    assert response.status_code == 400


def test_segment_rejects_image_over_upload_limit(
    sample_image_base64: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    class TinyLimits:
        max_upload_bytes = 8
        max_image_pixels = 1_000_000

    client = TestClient(app)
    monkeypatch.setattr('app.schemas.segmentation.get_settings', lambda: TinyLimits())
    response = client.post('/api/segment', json={'image_base64': sample_image_base64})
    assert response.status_code == 400


def test_segment_accepts_valid_request(sample_image_base64: str, monkeypatch: pytest.MonkeyPatch) -> None:
    client = TestClient(app)

    def fake_generate_mask(*args, **kwargs):
        return {
            'mask_data_url': 'data:image/png;base64,AAAA',
            'pixel_area': 16,
            'processing_time_ms': 123,
            'confidence': 0.91,
            'region_label': 'tumor',
            'status': 'success',
            'message': 'ok',
        }

    monkeypatch.setattr('app.routes.segmentation.generate_mask', fake_generate_mask)
    response = client.post(
        '/api/segment',
        json={
            'image_base64': sample_image_base64,
            'text_prompt': 'brain tumor',
            'positive_points': [{'x': 0.5, 'y': 0.5}],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload['pixel_area'] == 16
    assert payload['status'] == 'success'
