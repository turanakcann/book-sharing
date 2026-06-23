from sqlalchemy import Column, Integer, String, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"  # Veritabanındaki tablo adı
    
    id = Column(Integer, primary_key=True, index=True) #Otomatik artan birincil anahtar (Primary Key) ve indekslenmiş
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(50), nullable=False)
    surname = Column(String(50), nullable=False)
    birth_date = Column(Date, nullable=False)
    city = Column(String(80), nullable=False)
    district = Column(String(80), nullable=False)
    created_at = Column(DateTime, server_default=func.now()) #Otomatik olarak oluşturulma tarihi eklenir
    
    books = relationship("Book", back_populates="adder")
    listings = relationship("Listing", back_populates="owner")
    requests = relationship("Request", back_populates="requester")