from rank_bm25 import BM25Okapi
from pymongo import MongoClient
from bson.objectid import ObjectId
from utils import tokenize

class BM25SearchEngine:
    def __init__(self, mongo_uri, db_name, collection_name):
        self.client = MongoClient(mongo_uri)
        self.collection = self.client[db_name][collection_name]
        self.documents = []
        self.tokenized = []
        self.id_map = []
        self.bm25 = None
        self.refresh_index()

    def refresh_index(self):
        self.documents = []
        self.tokenized = []
        self.id_map = []
        cursor = self.collection.find({})
        for doc in cursor:
            text = f"{doc.get('title', '')} {doc.get('content', '')} {doc.get('summary', '')}"
            self.documents.append(text)
            self.tokenized.append(tokenize(text))
            self.id_map.append(doc)
        self.bm25 = BM25Okapi(self.tokenized)

    def search(self, query, filters=None, limit=10):
        query_tokens = tokenize(query)
        scores = self.bm25.get_scores(query_tokens)
        sorted_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        results = []

        for idx in sorted_indices:
            doc = self.id_map[idx]
            if scores[idx] == 0:
                continue            # Advanced filter
            if filters:
                if filters.get("category") and doc.get("category") != filters["category"]:
                    continue
                if filters.get("isVerified") is not None and doc.get("isVerified") != filters["isVerified"]:
                    continue
                if filters.get("author"):
                    author_name = doc.get("author", {}).get("name", "").lower()
                    if filters["author"].lower() not in author_name:
                        continue
                if filters.get("tags"):
                    # Skip documents that don't have the requested tag
                    doc_tags = doc.get("tags", [])
                    if not any(tag.lower() in [t.lower() for t in doc_tags] for tag in filters["tags"]):
                        continue

            doc["_id"] = str(doc["_id"])
            results.append(doc)
            if len(results) >= limit:
                break
        return results
