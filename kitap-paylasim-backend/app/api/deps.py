from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

# İŞTE KİLİT İKONUNU GETİRECEK OLAN SİHİRLİ NESNE:
# FastAPI'ye "Kullanıcıdan token iste ve bu token'ı /api/v1/login adresinden alabilirler" diyoruz
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    
    """
    Kullanıcının gönderdiği token'ı deşifre eder. 
    Eğer geçerliyse veritabanından kullanıcıyı bulup döndürür.
    Geçersizse acımasızca 401 hatası fırlatıp kapı dışarı eder.
    """
    credentials_exceptions = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Kimlik doğrulanamadı. Token geçersiz veya süresi dolmuş.",
        headers = {"WWW-Authenticate": "Bearer"}
    )
    
    try:
        # Token'ı SECRET_KEY'imiz ile çözüyoruz
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Login olurken payload içine "sub" anahtarıyla user.id'yi gömmüştük, onu geri alıyoruz
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exceptions
    
    except jwt.PyJWTError:
        # Token sahteyse veya süresi dolmuşsa direkt patlat
        raise credentials_exceptions
    
    # Her şey yolundaysa ID ile kullanıcıyı veritabanında bul
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exceptions
    
    return user