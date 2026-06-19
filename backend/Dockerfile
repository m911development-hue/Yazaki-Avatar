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

# Download Piper hi_IN-prabhat-medium voice via huggingface_hub (handles URL resolution)
RUN mkdir -p /app/voices && python -c "\
from huggingface_hub import hf_hub_download; \
import shutil, os; \
base = 'hi/hi_IN/prabhat/medium/hi_IN-prabhat-medium'; \
[shutil.copy(hf_hub_download('rhasspy/piper-voices', base+e), '/app/voices/hi_IN-prabhat-medium'+e) for e in ['.onnx', '.onnx.json']]; \
print('Voice size:', os.path.getsize('/app/voices/hi_IN-prabhat-medium.onnx'), 'bytes') \
"

# Verify piper loads the voice successfully at build time
RUN python -c "from piper import PiperVoice; import os; v='/app/voices/hi_IN-prabhat-medium.onnx'; print('Size:',os.path.getsize(v),'bytes'); PiperVoice.load(v); print('Piper OK')"

COPY backend/ .

COPY --from=frontend-builder /frontend/dist/ ./app/static/frontend/

RUN mkdir -p ./data/chroma_store

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
