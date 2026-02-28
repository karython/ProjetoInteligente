# /app/core/config.py
from pydantic_settings import BaseSettings
from typing import Optional

from dotenv import load_dotenv
import os
load_dotenv()
class Settings(BaseSettings):
    PROJECT_NAME: str = "NOME_DO_SISTEMA"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRETY_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    AI_PROVIDER: str = "GROQ"  # or "groq"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = "llama-3.1-70b-versatile" 

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3:8b-instruct"
    
    class Config:
        case_sensitive = True


settings = Settings()