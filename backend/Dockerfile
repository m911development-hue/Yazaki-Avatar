FROM python:3.11-slim

RUN apt-get update && apt-get install -y gcc g++ curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies pehle (cache ke liye)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sentence Transformers model build time pe download karo
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# App code
COPY backend/ .

# Frontend dist → static folder mein
COPY frontend/dist/ ./app/static/frontend/

# Data directory
RUN mkdir -p ./data/chroma_store

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]