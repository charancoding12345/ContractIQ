# app/config.py
from __future__ import annotations
import json
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    ALLOWED_ORIGINS: str = '["http://localhost:3000","http://127.0.0.1:3000"]'
    MAX_UPLOAD_MB: float = 12
    MAX_PAGES: int = 10
    MIN_DPI: int = 100
    MAX_DPI: int = 300
    OCR_TIMEOUT_SEC: int = 45
    TESSERACT_PATH: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def cors_origins(self) -> List[str]:
        try:
            arr = json.loads(self.ALLOWED_ORIGINS)
            if isinstance(arr, list):
                return list(dict.fromkeys(arr))
        except Exception:
            pass
        return [self.FRONTEND_ORIGIN]

settings = Settings()
