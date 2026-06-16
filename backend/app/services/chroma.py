import chromadb
from chromadb.utils import embedding_functions
from app.config import config
import uuid

class ChromaService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=config.CHROMA_PERSIST_DIR)
        self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()  # type: ignore[arg-type]
        self.collection = self.client.get_or_create_collection(
            name=config.CHROMA_COLLECTION_NAME,
            embedding_function=self.embedding_fn,  # type: ignore[arg-type]
            metadata={"hnsw:space": "cosine"}
        )

    def insert_chunks(self, chunks: list):
        if not chunks:
            return

        documents = []
        metadatas = []
        ids = []

        for chunk in chunks:
            documents.append(chunk["text"])
            metadatas.append({
                "source": chunk["source"],
                "title": chunk["title"],
                "chunk_id": chunk["chunk_id"]
            })
            ids.append(str(uuid.uuid4()))

        # Insert in batches of 100
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            self.collection.add(
                documents=documents[i:i+batch_size],
                metadatas=metadatas[i:i+batch_size],  # type: ignore[arg-type]
                ids=ids[i:i+batch_size]
            )

        print(f"Inserted {len(documents)} chunks into ChromaDB")

    def search(self, query: str, top_k: int = 5):
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k
        )

        chunks = []
        if results and results["documents"]:
            for i, doc in enumerate(results["documents"][0]):
                chunks.append({
                    "text": doc,
                    "source": results["metadatas"][0][i]["source"],  # type: ignore[index]
                    "title": results["metadatas"][0][i]["title"],    # type: ignore[index]
                    "distance": results["distances"][0][i] if results.get("distances") else 0  # type: ignore[index]
                })

        return chunks

    def delete_all(self):
        self.client.delete_collection(config.CHROMA_COLLECTION_NAME)
        self.collection = self.client.get_or_create_collection(
            name=config.CHROMA_COLLECTION_NAME,
            embedding_function=self.embedding_fn,  # type: ignore[arg-type]
            metadata={"hnsw:space": "cosine"}
        )
        print("ChromaDB collection cleared")

    def get_count(self):
        try:
            return self.collection.count()  # ✅ Fixed: was missing indentation
        except Exception:
            return 0

chroma_service = ChromaService()