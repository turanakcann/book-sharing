from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal

class ListingBase(BaseModel):
    book_id: int
    listing_type: str = Field(..., description="Bağış, Takas veya Satış")
    condition: str = Field(..., description="Yeni & Etiketli, İyi, Ortalama")
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[Decimal] = Field(default=Decimal("00.0"), description="Eğer ilan Satılık ise zorunlu")
    
class ListingCreate(ListingBase):
    pass

class ListingResponse(ListingBase):
    id: int
    owner_id: int
    is_active: bool
    
    class Config:
        from_attributes = True