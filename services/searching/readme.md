# Searchig service

```bash
conda env create -f environment.yml
``

```bash
python -m nltk.downloader punkt
```

```bash
conda activate se104-bm25-search-api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
