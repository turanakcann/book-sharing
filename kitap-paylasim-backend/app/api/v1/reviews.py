from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.review import Review
from app.models.listing import Listing
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kendi kendine puan veremezsin
    if current_user.id == review_in.reviewee_id:
        raise HTTPException(status_code=400, detail="Kendinize puan veremezsiniz")
    
    # İlan var mı?
    listing = db.query(Listing).filter(Listing.id == review_in.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    
    # Spam Kontrolü: Bu ilanda bu kişiye daha önce puan verdin mi?
    existing_review = db.query(Review).filter(
        Review.listing_id == review_in.listing_id,
        Review.reviewer_id == current_user.id,
        Review.reviewee_id == review_in.reviewee_id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="Bu ilan için zaten değerlendirme bulunmakta!")
    
    new_review = Review(
        **review_in.model_dump(),
        reviewer_id=current_user.id
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return new_review

@router.get("/user/{user_id}", response_model=List[ReviewResponse])
def get_user_reviews(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Bir kullanıcının ALDIĞI tüm değerlendirmeleri listeler."""
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()
    return reviews