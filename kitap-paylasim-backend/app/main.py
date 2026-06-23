import os
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

# Altyapı ve veritabanı bağlantıları
from app.db.session import engine, Base, get_db

# DİKKAT: Modelleri burada import etmezsek SQLAlchemy tabloları oluşturmaz!
from app.models.user import User
from app.models.book import Book
from app.models.listing import Listing

# YENİ EKLENEN: Yazdığımız router'ı içeri aktarıyoruz
from app.api.v1 import users, auth, books, listings

# Veritabanı tablolarını otomatik oluşturma (Sihirli komut)
Base.metadata.create_all(bind=engine)

# FastAPI uygulamasını ayağa kaldırma
app = FastAPI(
    title = "Kitap Paylaşım Platformu API",
    version = "1.0.0",
    description = "Okuyan, paylaşan ve kültürlenen bir topluluk için API altyapısı"
)

os.makedirs("uploads", exist_ok=True)

# YENİ EKLENEN: Router(Users)'ı ana uygulamaya bağlıyoruz
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(books.router, prefix="/api/v1/books", tags=["Books"])
app.include_router(listings.router, prefix="/api/v1/listings", tags=["Listings"])
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get("/")
def read_root():
    return {"mesaj":"Sistem aktif. Kitap Paylaşım API'sine hoş geldin."}

@app.get("/db-test")
def test_db_connection(db: Session = Depends(get_db)):
    return {"mesaj": "Veritabanı bağlantısı başarılı ve izole oturum (session) enjekte edildi!"}

