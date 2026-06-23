from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.db.session import Base

class Request(Base):
    __tablename__ = "requests"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Hangi ilana talep atıldı?
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    
    # Talebi kim attı? (Kitabı isteyen kullanıcı)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Talebin anlık durumu: "PENDING" (Bekliyor), "ACCEPTED" (Kabul), "REJECTED" (Red)
    status = Column(String(20), default="PENDING", nullable=False, index=True)
    
    # Kitabı isterken atılacak not/mesaj (Örn: "Abi yarın ZBEU kampüste elden alabilirim")
    message = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    
    # Durum güncellendiğinde (Kabul/Red) zamanı otomatik günceller
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # İLİŞKİLER (RELATIONSHIPS):
    listing = relationship("Listing", back_populates="requests")
    requester = relationship("User", back_populates="requests")
    
    