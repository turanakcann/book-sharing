from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# 1. Ortak Özellikler
class RequestBase(BaseModel):
    listing_id: int
    message: Optional[str] = Field(None, max_length=500, description="İlan sahibine iletilecek not!")
    
# 2. İstek Şeması: Kullanıcı bir kitaba talip olurken bu formatta veri gönderecek
class RequestCreate(RequestBase):
    pass

# 3. Durum Güncelleme Şeması: İlan sahibi talebi kabul veya reddederken sadece bu alanı değiştirecek
class RequestUpdateStatus(BaseModel):
    status: str = Field(..., description="Sadece 'Onaylandı' veya 'Reddedildi' değerlerini alabilir")

# 4. Yanıt Şeması: Talepleri listelerken dışarı fırlatacağımız format
class RequestResponse(RequestBase):
    id: int
    requester_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True # SQLAlchemy ORM modelini JSON'a otomatik çevirir