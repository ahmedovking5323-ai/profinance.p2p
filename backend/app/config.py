import os
from typing import List

try:
    from pydantic_settings import BaseSettings
    class Settings(BaseSettings):
        PROJECT_NAME: str = "KG USDT P2P Exchange API"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api/v1"
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        ADMIN_SECRET_KEY: str = os.getenv("ADMIN_SECRET_KEY", "kg_admin_secret_key_bishkek_2026")
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-project-id.supabase.co")
        SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key")
        SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "your-anon-key")
        DEFAULT_USD_KGS_RATE: float = 87.50
        DEFAULT_MARGIN_PERCENT: float = 1.20
        CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "https://*.vercel.app",
            "*"
        ]
        class Config:
            env_file = ".env"
            extra = "ignore"
except ImportError:
    from pydantic import BaseModel
    class Settings(BaseModel):
        PROJECT_NAME: str = "KG USDT P2P Exchange API"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api/v1"
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        ADMIN_SECRET_KEY: str = os.getenv("ADMIN_SECRET_KEY", "kg_admin_secret_key_bishkek_2026")
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-project-id.supabase.co")
        SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key")
        SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "your-anon-key")
        DEFAULT_USD_KGS_RATE: float = 87.50
        DEFAULT_MARGIN_PERCENT: float = 1.20
        CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "https://*.vercel.app",
            "*"
        ]

settings = Settings()
