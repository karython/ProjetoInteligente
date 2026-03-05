# /app/core/config.py
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Resolve to the project root .env regardless of where the server is run from
_ENV_FILE = str(Path(__file__).resolve().parent.parent.parent.parent / ".env")


class Settings(BaseSettings):
    PROJECT_NAME: str = "NOME_DO_SISTEMA"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    DATABASE_URL: str

    AI_PROVIDER: str = "GROQ"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3:8b-instruct"

    class Config:
        case_sensitive = True
        env_file = _ENV_FILE


settings = Settings()