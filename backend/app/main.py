from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os

from app.config import config
from app.services.rag import rag_service
from app.services.images import image_service

app = FastAPI(
    title=config.APP_NAME,
    description="AI-Powered Voice Knowledge Assistant for Metaverse911",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# ── Startup ────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    count = rag_service.chroma.get_count()
    print(f"ChromaDB has {count} chunks on startup")

# ── Request Models ─────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str
    conversation_history: Optional[list] = []

# ── Routes ─────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "app": config.APP_NAME,
        "chunks_in_db": rag_service.chroma.get_count()
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    question = request.question.strip()

    blocked = ["ignore previous", "forget instructions", "system prompt", "jailbreak", "act as"]
    for phrase in blocked:
        if phrase in question.lower():
            raise HTTPException(status_code=400, detail="Invalid input detected")

    result = await rag_service.query(question)
    image_result = image_service.get_images_for_query(question)

    return {
        "answer": result["answer"],
        "sources": result["sources"],
        "images": image_result["images"],
        "topic": image_result["topic"],
        "chunks_found": result["chunks_found"]
    }

@app.post("/voice-query")
async def voice_query(request: ChatRequest):
    return await chat(request)

@app.get("/related-image")
async def related_image(query: str):
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    result = image_service.get_images_for_query(query)
    return result

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """PDF upload karke knowledge base mein add karo"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sirf PDF files allowed hain")
    try:
        result = await rag_service.add_pdf(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/clear-knowledge-base")
async def clear_knowledge_base():
    try:
        rag_service.chroma.delete_all()
        return {"status": "success", "message": "Knowledge base cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Frontend Serve (production) ────────────────────────────
frontend_dist = os.path.join(os.path.dirname(__file__), "static", "frontend")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=config.DEBUG)