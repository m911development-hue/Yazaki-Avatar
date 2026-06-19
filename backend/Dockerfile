FROM node:20-slim AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM python:3.11-slim

RUN apt-get update && apt-get install -y gcc g++ curl libsndfile1 espeak-ng espeak-ng-data && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Pre-cache ChromaDB's built-in ONNX embedding model so startup doesn't download it
RUN python -c "from chromadb.utils import embedding_functions; ef = embedding_functions.DefaultEmbeddingFunction(); ef(['warmup'])"

# Download Piper Prabhat voice — script lists the repo first so wrong names fail fast
COPY backend/scripts/download_piper_voice.py /tmp/download_piper_voice.py
RUN python /tmp/download_piper_voice.py

# Verify piper can load the downloaded voice before deployment
RUN python -c "from piper import PiperVoice; import os; v=open('/app/voices/selected_voice.txt').read().strip(); p='/app/voices/'+v+'.onnx'; print('Loading',p,'(',os.path.getsize(p),'bytes)'); PiperVoice.load(p); print('Piper OK')"

COPY backend/ .

COPY --from=frontend-builder /frontend/dist/ ./app/static/frontend/

RUN mkdir -p ./data/chroma_store

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
