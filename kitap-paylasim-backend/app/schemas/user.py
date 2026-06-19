from pydantic import BaseModel, EmailStr
from datetime import date

# Ortak Özellikler: Hem oluştururken hem de geri dönerken ortak olan alanlar
class UserBase(BaseModel):
    username: str
    email: EmailStr # Pydantic bunun geçerli bir e-posta formatı olup olmadığını otomatik denetler
    name: str
    surname: str
    birth_date: date
    city: str
    district: str
    
# İstek Şeması (Request): Kullanıcı kayıt olurken frontend'den bize gelecek veri
class UserCreate(UserBase):
    password: str

# Yanıt Şeması (Response): Veritabanından çekip frontend'e yollayacağımız veri
class UserResponse(UserBase):
    id: int
    # ŞİFRE KESİNLİKLE BURADA YER ALMAZ. Böylece dışarıya şifre sızdırmayız.
    
    class Config:
        from_attributes = True # SQLAlchemy ORM modelini otomatik olarak Pydantic JSON nesnesine çevirmek için kritik!