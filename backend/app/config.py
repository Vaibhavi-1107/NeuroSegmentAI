from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = BACKEND_ROOT / '.env'


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding='utf-8',
        extra='ignore',
        protected_namespaces=(),
    )

    model_api_key: str | None = Field(default=None, alias='MODEL_API_KEY')
    api_base_url: str = Field(default='https://api.meta.ai/v1', alias='API_BASE_URL')
    cors_origins: str = Field(default='http://localhost:5173,http://127.0.0.1:5173', alias='CORS_ORIGINS')
    request_timeout_seconds: float = Field(default=60.0, alias='REQUEST_TIMEOUT_SECONDS')
    max_upload_bytes: int = Field(default=10 * 1024 * 1024, alias='MAX_UPLOAD_BYTES')
    max_image_pixels: int = Field(default=16_000_000, alias='MAX_IMAGE_PIXELS')

    @property
    def cors_origins_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(',') if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


def has_model_api_key() -> bool:
    key = (get_settings().model_api_key or '').strip()
    return bool(key)


def require_model_api_key() -> str:
    key = (get_settings().model_api_key or '').strip()
    if not key:
        raise RuntimeError('MODEL_API_KEY is not configured. Add it to backend/.env before starting live Meta SAM inference.')
    return key
