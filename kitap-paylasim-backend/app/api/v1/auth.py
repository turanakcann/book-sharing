from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.schemas.token import Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    # 1. KONTROL: Kullanıcı veritabanında var mı?
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # 2. GÜVENLİK: Kullanıcı yoksa veya şifre yanlışsa HATA fırlat
    # Öğretici Not: Acımasız güvenlik kuralı der ki; kullanıcıya "Email yanlış" veya "Şifre yanlış" diye
    # spesifik detay verme. "Bilgiler hatalı" de geç ki, hackerlar sistemde kimin kayıtlı olduğunu bulamasın.
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. BAŞARI: JWT Token'ı üret ve gönder
    access_token = create_access_token(data={"sub": str(user.id)}) # Payload'a kullanıcının ID'sini (sub) gömüyoruz
    
    return {"access_token": access_token, "token_type": "bearer"}