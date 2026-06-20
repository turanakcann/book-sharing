import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_TITLE: str = "Kitap Paylaşım Platformu API"
    PROJECT_VERSION: str = "1.0.0"
    
    # .env dosyasından verileri oku, bulamazsa varsayılanı kullan
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "postgres")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "gizli_anahtar_yok")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))  # Varsayılan olarak 24 saat
    
    @property
    def DATABASE_URL(self) -> str:
        # SQLAlchemy'nin PostgreSQL ile konuşabilmesi için bağlantı dizesi (Connection String)
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
settings = Settings()