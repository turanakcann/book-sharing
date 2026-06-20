from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime

# 1. Ortak Özellikler
class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Kitabın Tam Adı")
    author: str = Field(..., min_length=1, max_length=255, description="Yazarın Adı")
    isbn: str = Field(..., min_length=10, max_length=13, description="Uluslararası Standart Kitap Numarası (ISBN-10 veya ISBN-13)")
    published_year: Optional[int] = Field(None, ge=1000, le=datetime.utcnow().year(), description="Basım Yılı")
    page_count: Optional[int] = Field(None, gt=0, description="Sayfa Sayısı")
    description: Optional[str] = Field(None, max_length=1000)

# 2. İstek Şeması: Kullanıcı sisteme yeni bir kitap eklerken bu formatta veri gönderecek    
class BookCreate(BookBase):
    pass # Şimdilik ekstra bir gizli alan istemiyoruz, Base'deki her şey yeterli.

# 3. Yanıt Şeması: Veritabanından çekip dışarı fırlatacağımız format
class BookResponse(BookBase):
    id: int
    added_by_id: int # Bu kitabı global kataloğa kimin eklediğini tutacağımız referans
    
    class Config:
        from_attributes = True # SQLAlchemy modelini JSON'a çevirmek için sihirli ayar