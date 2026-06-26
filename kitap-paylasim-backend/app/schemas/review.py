from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    listing_id: int
    reviewee_id: int
    rating: int = Field(..., ge=1, le=5, description="1 ile 5 arasında bir puan")
    comment: Optional[str] = Field(None, max_length=500)
    
class ReviewResponse(BaseModel):
    id: int
    listing_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True