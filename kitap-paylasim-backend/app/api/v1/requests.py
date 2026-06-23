from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.request import Request
from app.models.user import User
from app.models.listing import Listing
from app.schemas.request import RequestCreate, RequestResponse, RequestUpdateStatus
from app.api.deps import get_current_user

router = APIRouter()

@router.post("", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    req_in: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının başka birinin ilanına talep göndermesini sağlar.
    """
    
    # 1. KONTROL: İlan gerçekten var mı ve hala aktif mi?
    listing = db.query(Listing).filter(Listing.id == req_in.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    
    if not listing.is_active:
        raise HTTPException(status_code=400, detail="Bu ilan artık aktif değil.")
    
    # 2. KONTROL: Kendi kitabını isteyemezsin (Mantık hatası)
    if listing.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Kendi ilanınıza talep gönderemezsiniz")
    
    # 3. KONTROL: Spam önleyici. Zaten "PENDING" durumunda bir talebi var mı?
    existing_req = db.query(Request).filter(
        Request.listing_id == req_in.listing_id,
        Request.requester_id == current_user.id,
        Request.status == "PENDING"
    ).first()
    
    if existing_req:
        raise HTTPException(status_code=400, detail="Bu ilan için zaten yanıt bekleyen bir talebiniz bulunmakta!")
    
    # 4. VERİTABANINA YAZ
    new_request = Request(
        **req_in.model_dump(),
        requester_id = current_user.id
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return new_request
    
@router.get("/received", response_model=List[RequestResponse])
def get_received_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının SAHİBİ OLDUĞU ilanlara gelen tüm talepleri listeler.
    SQLAlchemy'nin 'join' sihrini kullanıyoruz.
    """
    
    # Request tablosu ile Listing tablosunu birleştir. Sadece benim ilanlarıma gelenleri getir.
    requests = db.query(Request).join(Listing).filter(Listing.owner_id == current_user.id).all()
    return requests

@router.patch("/{request_id}/status", response_model=RequestResponse)
def update_request_status(
    request_id: int,
    status_update: RequestUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    İlan sahibi, kendisine gelen talebi ACCEPTED (Kabul) veya REJECTED (Red) olarak işaretler.
    """
    
    # Güvenlik çemberi: Beklenmeyen bir kelime gönderilirse patlat
    if status_update.status not in ["ACCEPTED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Geçersiz durum. Yalnızca 'Kabul edildi' veya 'Reddedildi' gönderilebilir")
    
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Talep bulunamadı!")
    
    # Yetki kontrolü: Bu talebi reddedecek/onaylayacak kişi, gerçekten o ilanın sahibi mi?
    listing = db.query(Listing).filter(Listing.id == req.listing_id).first()
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sadece ilanın sahibi bu talebi yanıtlayabilir")
    
    # Durumu güncelle ve kaydet
    req.status = status_update.status
    db.commit()
    db.refresh(req)
    
    return req