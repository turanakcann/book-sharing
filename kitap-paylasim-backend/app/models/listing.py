from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Numeric, func
from sqlalchemy.orm import relationship

from app.db.session import Base

class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Hangi Kitap? (Kataloğumuzdaki kitaba bağlıyoruz)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    
    # Kimin Kitabı? (İlanı açan kullanıcıya bağlıyoruz)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # İlan Tipi: "DONATION" (Bağış), "EXCHANGE" (Takas), "SALE" (Satılık)
    listing_type = Column(String(20), nullable=False, index=True)
    
    # Kitabın Durumu: "NEW" (Yeni), "GOOD" (İyi), "WORN" (Yıpranmış)
    condition = Column(String(20), nullable=False)
    
    # İlana özel açıklama (Örn: "Sayfalarda karalama yok, temizdir.")
    description = Column(String(500), nullable=True)
    
    # Eğer satılıksa fiyatı (Max 10 hane, virgülden sonra 2 hane Örn: 150.50)
    price = Column(Numeric(10,2), nullable=True, default=00.0)
    
    # İlan aktif mi? Kitap birine verilince bunu False yapacağız.
    is_active = Column(Boolean, default=True, index=True)
    
    created_at = Column(DateTime, server_default=func.now())
    
    # İLİŞKİLER (RELATIONSHIPS):
    # Bu ilan nesnesi üzerinden kitaba ve sahibine direkt Python nesnesi olarak erişebileceğiz.
    book = relationship("Book", back_populates="listings")
    owner = relationship("User", back_populates="listings")
    
    