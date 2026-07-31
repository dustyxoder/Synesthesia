"""Application settings loaded from environment / .env file."""
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    ENVIRONMENT: Literal["development", "production", "test"] = "development"
    LOG_LEVEL: str = "info"

    # ML
    MODEL_PATH: Path = Path("models/best_model.pt")
    SCALER_PATH: Path = Path("models/scaler.pkl")
    LABEL_ENCODER_PATH: Path = Path("models/label_encoder.pkl")
    MODEL_TYPE: Literal["cnn", "xgboost", "random_forest", "svm"] = "cnn"

    # LLM
    LLM_PROVIDER: Literal["openai", "anthropic", "mock"] = "mock"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-haiku-20241022"

    # Upload
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_AUDIO_EXTENSIONS: str = "mp3,wav,flac,ogg"
    TEMP_UPLOAD_DIR: Path = Path("tmp/uploads")

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def allowed_extensions(self) -> list[str]:
        return [e.strip().lower() for e in self.ALLOWED_AUDIO_EXTENSIONS.split(",")]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024


settings = Settings()
