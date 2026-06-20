from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.core.config import settings
import jwt

# bcrypt algoritmasını kullanarak bir şifreleme motoru (context) oluşturuyoruz
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    
    """
    Kullanıcı kayıt olurken verdiği düz şifreyi geri döndürülemez bir hash'e çevirir.
    Örnek: '123456' -> '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQ6V1U6m'
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    
    """
    Sisteme giriş yaparken (Login), kullanıcının girdiği şifre ile 
    veritabanındaki karmaşık hash'in eşleşip eşleşmediğini kontrol eder.
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    
    """
    Kullanıcı verisini (ID, username vs.) alır, içine son kullanma tarihi ekler 
    ve SECRET_KEY ile imzalayarak JWT üretir.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Şifreleme işlemini yap ve token'ı string olarak döndür
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
    