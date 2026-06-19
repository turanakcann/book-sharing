from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Engine: Veritabanıyla fiziksel bağlantıyı kuran motor
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# SessionLocal: Her istek geldiğinde veritabanında işlem yapmamızı sağlayacak oturum fabrikası
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: Yazacağımız tüm ORM modellerinin türeyeceği ana sınıf
Base = declarative_base()

# FastAPI endpoint'lerinde veritabanı oturumunu yönetmek için Dependency (Bağımlılık) fonksiyonu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() # İstek bittiğinde bağlantıyı mutlaka havuza geri bırak (Memory leak engelleme)