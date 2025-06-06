from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Post(BaseModel):
    id: str
    title: str
    content: str
    summary: Optional[str]
    author: Optional[str]
    likes: Optional[int]
    comments: Optional[List[str]]
    category: Optional[str]
    isVerified: Optional[bool]
    createdAt: Optional[datetime]
    updatedAt: Optional[datetime]
