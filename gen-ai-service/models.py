from pydantic import BaseModel, Field
from typing import List, Optional

class Property(BaseModel):
    title: str
    propertyType: str

    addressLine: Optional[str] = ""
    city: str
    state: str
    pincode: Optional[str] = ""

    monthlyRent: Optional[float] = 0.0
    capacity: Optional[int] = 1

    available: Optional[bool] = True

    amenities: Optional[List[str]] = []
    imageUrls: Optional[List[str]] = []

class PropertySearchRequest(BaseModel):
    query: str

class PropertySearchFilters(BaseModel):
    city: Optional[str] = None
    propertyType: Optional[str] = None
    minRent: Optional[float] = None
    maxRent: Optional[float] = None
    minCapacity: Optional[int] = None
    keyword: Optional[str] = None
    amenities: List[str] = Field(default_factory=list)