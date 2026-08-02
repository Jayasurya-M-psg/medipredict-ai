from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "MediPredict"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "medipredict-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # MongoDB
    MONGO_URI: str = "mongodb+srv://jayasuryamurugesan29_db_user:jsurya2912@cluster0.bbztikn.mongodb.net/medipredict"
    MONGO_DB_NAME: str = "medipredict"

    # CORS — "*" allows any frontend (Vercel, phones, etc.)
    ALLOWED_ORIGINS: str = "*"

    # Port — Render sets PORT automatically
    PORT: int = 8000

    @property
    def origins_list(self) -> List[str]:
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
