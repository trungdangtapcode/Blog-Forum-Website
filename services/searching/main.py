from fastapi import FastAPI, Query, Body
from typing import Optional
from search_engine import BM25SearchEngine
from dotenv import load_dotenv
from models import SearchRequest
import os

# Load environment variables
load_dotenv()

# Read config from environment
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB")
COLLECTION_NAME = os.getenv("MONGO_COLLECTION")

app = FastAPI()

# Initialize BM25 engine
search_engine = BM25SearchEngine(MONGO_URI, DB_NAME, COLLECTION_NAME)

@app.post("/search")
def search_posts(search_request: SearchRequest):
    filters = {
        "category": search_request.category,
        "isVerified": search_request.isVerified,
        "author": search_request.author,
        "tags": search_request.tags
    }
    results = search_engine.search(
        search_request.q, 
        filters=filters, 
        limit=search_request.limit
    )
    return {"results": results}

# Keep the GET endpoint for backward compatibility
@app.get("/search")
def search_posts_get(
    q: str = Query(..., min_length=1),
    limit: int = 10,
    category: Optional[str] = None,
    isVerified: Optional[bool] = None,
    author: Optional[str] = None,
    tags: Optional[list[str]] = None
):
    filters = {
        "category": category,
        "isVerified": isVerified,
        "author": author,
        "tags": tags
    }
    results = search_engine.search(q, filters=filters, limit=limit)
    return {"results": results}

@app.post("/refresh")
def refresh_index():
    search_engine.refresh_index()
    return {"status": "Index refreshed"}
