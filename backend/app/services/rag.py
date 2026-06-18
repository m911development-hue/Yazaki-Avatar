from app.services.chroma import chroma_service
from app.services.openrouter_service import openrouter_service
import uuid
import io
import os

class RAGService:
    def __init__(self):
        self.chroma = chroma_service
        self.llm = openrouter_service
        self.top_k = 5

    def build_context(self, chunks: list) -> str:
        if not chunks:
            return ""
        context_parts = []
        for i, chunk in enumerate(chunks):
            context_parts.append(
                f"[Source {i+1}: {chunk['title']}]\n{chunk['text']}\nURL: {chunk['source']}"
            )
        return "\n\n---\n\n".join(context_parts)

    async def query(self, question: str) -> dict:
        chunks = self.chroma.search(question, top_k=self.top_k)

        print(f"Chunks found: {len(chunks) if chunks else 0}")
        if chunks:
            print(f"Best distance: {min(c.get('distance', 1.0) for c in chunks)}")

        if not chunks:
            return {
                "answer": "I'm sorry, I couldn't find relevant information in the Domestic Travel Policy. Please contact the HR department for assistance.",
                "sources": [],
                "chunks_found": 0
            }

        context = self.build_context(chunks)
        answer = await self.llm.generate_answer(question, context)
        sources = list({c["source"] for c in chunks})

        return {
            "answer": answer,
            "sources": sources,
            "chunks_found": len(chunks)
        }

    def _pdf_to_chunks(self, pdf_bytes: bytes, filename: str) -> list:
        """Shared chunking logic for both upload and auto-ingest."""
        try:
            from pypdf import PdfReader
        except ImportError:
            raise Exception("pypdf not installed: pip install pypdf")

        pdf = PdfReader(io.BytesIO(pdf_bytes))
        chunks = []

        for page_num, page in enumerate(pdf.pages):
            text = (page.extract_text() or "").strip()
            if len(text) < 50:
                continue

            words = text.split()
            for i in range(0, len(words), 450):
                chunk_text = " ".join(words[i:i+500])
                if len(chunk_text) > 100:
                    chunks.append({
                        "text": chunk_text,
                        "source": f"PDF: {filename} (page {page_num+1})",
                        "title": filename,
                        "chunk_id": str(uuid.uuid4())
                    })

        return chunks

    async def ingest_default_pdf(self):
        """
        Auto-ingest the default PDF on startup if ChromaDB is empty.
        PDF must be present at this path inside the Docker container.
        """
        # ── Change this path if your PDF filename is different ──
        pdf_path = os.path.join(
            os.path.dirname(__file__),   # /app/app/services/
            "..", "..", "data",           # /app/data/
            "yazaki_travel_policy.pdf"   # ← YOUR PDF FILENAME HERE
        )
        pdf_path = os.path.abspath(pdf_path)

        if not os.path.exists(pdf_path):
            print(f"[RAG] Default PDF not found at: {pdf_path}")
            print("[RAG] Skipping auto-ingest. Upload PDF manually via /upload-pdf")
            return

        print(f"[RAG] Ingesting: {pdf_path}")
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        filename = os.path.basename(pdf_path)
        chunks = self._pdf_to_chunks(pdf_bytes, filename)

        if not chunks:
            print("[RAG] No readable text found in PDF.")
            return

        self.chroma.insert_chunks(chunks)
        print(f"[RAG] Ingested {len(chunks)} chunks from {filename}")

    async def add_pdf(self, file) -> dict:
        """Handle PDF uploads via /upload-pdf endpoint."""
        contents = await file.read()
        chunks = self._pdf_to_chunks(contents, file.filename)

        if not chunks:
            return {"status": "error", "message": "No readable text found in PDF."}

        self.chroma.insert_chunks(chunks)

        try:
            from pypdf import PdfReader
            page_count = len(PdfReader(io.BytesIO(contents)).pages)
        except Exception:
            page_count = 0

        return {
            "status": "success",
            "filename": file.filename,
            "pages": page_count,
            "chunks_inserted": len(chunks)
        }


rag_service = RAGService()