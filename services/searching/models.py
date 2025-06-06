# Definition for search request model
from pydantic import BaseModel, Field
from typing import Optional, List

class SearchRequest(BaseModel):
    q: str = Field(..., min_length=1)
    limit: int = 10
    category: Optional[str] = None
    isVerified: Optional[bool] = None
    author: Optional[str] = None
    tags: Optional[List[str]] = None
