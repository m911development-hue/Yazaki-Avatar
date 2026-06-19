FROM node:20-slim AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM python:3.11-slim

RUN apt-get update && apt-get install -y gcc g++ curl libsndfile1 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

RUN python -c "from chromadb.utils import embedding_functions; ef = embedding_functions.DefaultEmbeddingFunction(); ef(['warmup'])"

COPY backend/ .

COPY --from=frontend-builder /frontend/dist/ ./app/static/frontend/

RUN mkdir -p ./data/chroma_store

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
