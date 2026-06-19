FROM node:20-slim AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM python:3.11-slim

RUN apt-get update && apt-get install -y gcc g++ curl wget && rm -rf /var/lib/apt/lists/*

# Install Piper TTS binary (Linux x86_64)
RUN wget -q -O /tmp/piper.tar.gz \
      "https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_linux_x86_64.tar.gz" \
    && mkdir -p /opt/piper \
    && tar -xzf /tmp/piper.tar.gz -C /opt/ \
    && chmod +x /opt/piper/piper \
    && rm /tmp/piper.tar.gz

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Download Prabhat voice model before COPY so this layer is cached independently
RUN mkdir -p /app/models/piper \
    && wget -q -O /app/models/piper/en_IN-prabhat-medium.onnx \
       "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_IN/prabhat/medium/en_IN-prabhat-medium.onnx" \
    && wget -q -O /app/models/piper/en_IN-prabhat-medium.onnx.json \
       "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_IN/prabhat/medium/en_IN-prabhat-medium.onnx.json"

COPY backend/ .

COPY --from=frontend-builder /frontend/dist/ ./app/static/frontend/

RUN mkdir -p ./data/chroma_store

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
