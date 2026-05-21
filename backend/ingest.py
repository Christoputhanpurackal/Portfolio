import os
import json
from dotenv import load_dotenv
from google import genai
from utils.pdf_loader import load_pdfs

# Load environment variables
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

pdfs = [
    os.path.join(BASE_DIR, "data", "Christo_Complete_RAG_Portfolio.pdf"),
    os.path.join(BASE_DIR, "data", "Christo_RAG_Portfolio.pdf")
]

def split_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50):
    chunks = []
    text = text.replace("\r", "")
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        
        # Try to find a logical boundary near the end of the chunk
        if end < len(text):
            found = False
            # Search for double newline, single newline, sentence end, word boundary
            for sep in ["\n\n", "\n", ". ", " ", ", "]:
                pos = text.rfind(sep, start + chunk_size - 80, end)
                if pos != -1:
                    end = pos + len(sep)
                    found = True
                    break
            if not found:
                pos = text.rfind(" ", start, end)
                if pos != -1:
                    end = pos + 1
                    
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
            
        start = end - chunk_overlap
        if start <= 0 or start >= len(text) or end >= len(text):
            break
            
    return chunks

def run_ingestion():
    print("[INGEST] Loading PDFs...")
    docs = load_pdfs(pdfs)
    if not docs:
        print("[INGEST] No documents found to ingest.")
        return False

    print("[INGEST] Splitting documents...")
    chunks = []
    for doc in docs:
        split_chunks = split_text(doc.page_content, chunk_size=500, chunk_overlap=50)
        for chunk in split_chunks:
            chunks.append({
                "text": chunk,
                "metadata": doc.metadata
            })

    print(f"[INGEST] Created {len(chunks)} chunks.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[INGEST] ERROR: GEMINI_API_KEY is not set. Cannot generate embeddings.")
        return False

    try:
        print("[INGEST] Initializing Gemini Client...")
        client = genai.Client(api_key=api_key)

        print("[INGEST] Generating batch embeddings via Gemini API...")
        texts_to_embed = [c["text"] for c in chunks]
        
        response = client.models.embed_content(
            model="gemini-embedding-2",
            contents=texts_to_embed
        )

        print("[INGEST] Processing response embeddings...")
        for i, emb in enumerate(response.embeddings):
            chunks[i]["embedding"] = emb.values

        # Ensure directory exists
        vectorstore_dir = os.path.join(BASE_DIR, "vectorstore")
        os.makedirs(vectorstore_dir, exist_ok=True)
        
        # Save chunks with embeddings to JSON file
        vectorstore_file = os.path.join(vectorstore_dir, "vectorstore.json")
        with open(vectorstore_file, "w", encoding="utf-8") as f:
            json.dump(chunks, f, indent=2, ensure_ascii=False)

        print(f"[INGEST] Done. Saved {len(chunks)} vectors to {vectorstore_file}")
        return True
    except Exception as e:
        print(f"[INGEST] ERROR: Ingestion failed: {e}")
        import logging
        logging.exception(e)
        return False

if __name__ == "__main__":
    run_ingestion()