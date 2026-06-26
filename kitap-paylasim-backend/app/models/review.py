from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, CheckConstraint
from sqlalchemy.orm import relationship

from app.db.session import Base

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Hangi işlem (ilan) için bu puan veriliyor?
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    
    # Puanı veren kişi
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Puanı alan kişi (İlan sahibi veya kitabı alan kişi)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Puan (1 ile 5 arası) - Veritabanı seviyesinde de koruma (CheckConstraint) ekliyoruz
    rating = Column(Integer, CheckConstraint('rating >= 1 AND rating <=5'), nullable=False)
    
    # Yorum
    comment = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    
    # İLİŞKİLER (Çift yönlü bağlantı olduğu için foreign_keys ile kime ait olduğunu açıkça belirtiyoruz)
    listing = relationship("Listing")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_given")
    reviewee = relationship("User", foreign_keys=[reviewee_id], back_populates="reviews_received")