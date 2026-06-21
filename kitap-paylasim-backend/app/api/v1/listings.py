from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.listing import Listing
from app.models.user import User
from app.models.book import Book
from app.schemas.listing import ListingCreate, ListingResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # KİLİT: Sadece token'ı olanlar ilan açabilir
):
    """
    Sisteme yeni bir kitap ilanı ekler.
    Kullanıcının kimliği token üzerinden otomatik alınır.
    """
    
    # 1. MANTIK KONTROLÜ: Verilen book_id gerçekten kataloğumuzda var mı?
    book = db.query(Book).filter(Book.id == listing_in.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bu ID'e sahip bir kitap katalogda bulunmadı. Önce kitabı sisteme eklemelisiniz."
        )
    
    # 2. İŞ KURALI KONTROLÜ: Eğer ilan tipi SATILIK ise fiyat 0'dan büyük olmalı!
    if listing_in.listing_type == "SALE" and (listing_in.price is None or listing_in.price <= 0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Satılık ilanlarında geçerli bir fiyat belirtmek zorundasınız."
        )
    
    # 3. VERİTABANINA YAZMA:    
    new_listing = Listing(
        **listing_in.model_dump(),
        owner_id = current_user.id # İlanın sahibini token'dan gelen adam yapıyoruz
    )
    
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    
    return new_listing

@router.get("", response_model=List[ListingResponse])
def get_all_listings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Sistemdeki tüm AKTİF ilanları listeler. Sayfalama (Pagination) içerir.
    Token gerektirmez, herkes ilanlara bakabilir.
    """
    
    # DİKKAT: Sadece is_active == True olanları getiriyoruz ki satılmış kitaplar listeyi çöplüğe çevirmesin.
    listings = db.query(Listing).filter(Listing.is_active == True).offset(skip).limit(limit).all()
    return listings