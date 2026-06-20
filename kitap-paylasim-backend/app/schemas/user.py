from pydantic import BaseModel, EmailStr, Field
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
    
    # Şifre minimum 8, maksimum 50 karakter olabilir diyoruz.
    # Böylece 72 byte sınırına asla takılmayız ve DoS saldırılarını engelleriz.
    password: str = Field(..., min_length=8, max_length=50, description="Kullanıcı şifresi en az 8 karakter olmalıdır.")

# Yanıt Şeması (Response): Veritabanından çekip frontend'e yollayacağımız veri
class UserResponse(UserBase):
    id: int
    # ŞİFRE KESİNLİKLE BURADA YER ALMAZ. Böylece dışarıya şifre sızdırmayız.
    
    class Config:
        from_attributes = True # SQLAlchemy ORM modelini otomatik olarak Pydantic JSON nesnesine çevirmek için kritik!