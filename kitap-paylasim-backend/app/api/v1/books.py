from fastapi import APIRouter, status, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid

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

@router.post("/{book_id}/upload-cover", response_model=BookResponse)
def upload_book_cover(
    book_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Kitap Bulunamadı")
    
    if book.added_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sadece kitabı yükleyen kişi fotoğraf ekleyebilir!")
    
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Sadece JPEG veya PNG formatında resim yükleyebilirsiniz!")
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/{unique_filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    book.cover_image_url = f"/static/{unique_filename}"
    db.commit()
    db.refresh(book)
    
    return book