from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.models.book import Book
from app.schemas.book import BookCreate, BookResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book_in: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book_exists = db.query(Book).filter(Book.isbn == book_in.isbn).first()
    if book_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu ISBN numarasına ait kitap zaten kayıtlı!"
        )
        
    new_book = Book(
        **book_in.model_dump(),
        added_by_id = current_user.id
    )
    
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    
    return new_book

@router.get("/", response_model=List[BookResponse])
def get_books(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    books = db.query(Book).offset(skip).limit(limit).all()
    return books