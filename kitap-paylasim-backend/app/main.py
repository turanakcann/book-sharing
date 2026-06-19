from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

# Altyapı ve veritabanı bağlantıları
from app.db.session import engine, Base, get_db

# DİKKAT: Modelleri burada import etmezsek SQLAlchemy tabloları oluşturmaz!
from app.models.user import User

# Veritabanı tablolarını otomatik oluşturma (Sihirli komut)
Base.metadata.create_all(bind=engine)

# FastAPI uygulamasını ayağa kaldırma
app = FastAPI(
    title = "Kitap Paylaşım Platformu API",
    version = "1.0.0",
    description = "Okuyan, paylaşan ve kültürlenen bir topluluk için API altyapısı"
)

@app.get("/")
def read_root():
    return {"mesaj":"Sistem aktif. Kitap Paylaşım API'sine hoş geldin."}

@app.get("/db-test")
def test_db_connection(db: Session = Depends(get_db)):
    return {"mesaj": "Veritabanı bağlantısı başarılı ve izole oturum (session) enjekte edildi!"}

