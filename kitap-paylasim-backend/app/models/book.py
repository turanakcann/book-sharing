from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Book(Base):
    __tablename__ = "books" # Veritabanındaki tablo adı
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(150), nullable=False, index=True)
    
    # ISBN numaraları benzersizdir (unique=True). Aynı kitabı iki kere ekletmeyiz
    isbn = Column(String(13), unique=True, nullable=False, index=True)
    
    published_year = Column(Integer, nullable=True)
    page_count = Column(Integer, nullable=True)
    description = Column(String(1000), nullable=True)
    
    # YABANCI ANAHTAR (FOREIGN KEY): 
    # "Bu kitabı ekleyen kişinin ID'si, users tablosundaki id sütunundan gelir" diyoruz.
    added_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    cover_image_url = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    
    # İLİŞKİ (RELATIONSHIP) SİHRİ:
    # Veritabanında fiziksel bir sütun değildir. SQLAlchemy'nin Python tarafında nesneleri 
    # birbirine bağlamasını sağlar. book.adder dediğimizde o kullanıcının tüm bilgilerini getirir.
    adder = relationship("User", back_populates="books")
    listings = relationship("Listing", back_populates="book")
    