from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import get_password_hash
from app.api.deps import get_current_user

# Bu dosyadaki tüm endpoint'leri yönetecek router nesnesi
router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    
    # 1. KONTROL: Email veya Username daha önce alınmış mı?
    user_exists = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta adresi veya kullanıcı adı zaten kayıtlı." # Acımasız kural: Hata varsa anında işlemi kes ve 400 fırlat.
        )
        
    # 2. GÜVENLİK: Şifreyi hash'le
    hashed_pwd = get_password_hash(user_in.password)
    
    # 3. ORM NESNESİ: Yeni kullanıcıyı SQLAlchemy modeline dönüştür
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        name=user_in.name,
        surname=user_in.surname,
        birth_date=user_in.birth_date,
        city=user_in.city,
        district=user_in.district,
        password_hash=hashed_pwd # DİKKAT: Düz şifreyi değil, hashli şifreyi veriyoruz!
    )
    
    # 4. VERİTABANI İŞLEMİ: Kaydet ve onaylat
    db.add(new_user)
    db.commit() # Değişiklikleri veritabanına kalıcı olarak yaz
    db.refresh(new_user) # Veritabanından otomatik atanan ID'yi almak için nesneyi güncelle
    
    # Biz User nesnesi döndürüyoruz, `response_model=UserResponse` sayesinde 
    # FastAPI şifreyi otomatik olarak gizleyip sadece izin verilen verileri dışarı atacak.
    return new_user

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    
    # Gelen token get_current_user fonksiyonundan geçti, onaylandı ve bize 
    # doğrudan o kullanıcı nesnesi olarak geldi. Sadece geri döndürüyoruz.
    return current_user