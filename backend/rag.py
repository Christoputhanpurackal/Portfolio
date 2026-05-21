from dotenv import load_dotenv
import os
import logging
import json
from google import genai

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load .env
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"[INIT] BASE_DIR: {BASE_DIR}")

vector_db = []
client = None
vector_db_status = "not_initialized"

class Document:
    def __init__(self, page_content, metadata=None):
        self.page_content = page_content
        self.metadata = metadata or {}

# -----------------------------
# Initialize Vector DB
# -----------------------------
def load_vector_db():
    global vector_db_status, vector_db
    
    vs_path = os.path.join(BASE_DIR, "vectorstore")
    vs_file = os.path.join(vs_path, "vectorstore.json")

    print(f"[VECTOR_DB] Vector store path: {vs_path}")
    print(f"[VECTOR_DB] JSON file exists: {os.path.exists(vs_file)}")

    # If file doesn't exist, try to rebuild it
    if not os.path.exists(vs_file):
        print("[VECTOR_DB] Vector store file missing. Attempting auto-rebuild...")
        try:
            from ingest import run_ingestion
            success = run_ingestion()
            if not success:
                raise Exception("Auto-rebuild failed")
        except Exception as re_err:
            print(f"[VECTOR_DB] Rebuild error: {re_err}")
            vector_db_status = "error"
            return None

    if os.path.exists(vs_file):
        try:
            print("[VECTOR_DB] Loading vector database from JSON...")
            with open(vs_file, "r", encoding="utf-8") as f:
                loaded_db = json.load(f)
            print(f"[VECTOR_DB] Loaded successfully ({len(loaded_db)} vectors)")
            vector_db_status = "loaded"
            return loaded_db
        except Exception as e:
            print(f"[VECTOR_DB] Error reading JSON: {e}")
            vector_db_status = "error"
            return None
    else:
        vector_db_status = "missing_files"
        return None

# Load the vector store
vector_db = load_vector_db()

# -----------------------------
# Initialize Gemini
# -----------------------------
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        client = genai.Client(api_key=api_key)
        print("[GEMINI] Gemini initialized")
        logging.info("Gemini initialized")
    else:
        print("[GEMINI] GEMINI_API_KEY missing")
        client = None
except Exception as e:
    logging.exception(e)
    print(f"[GEMINI] ERROR: {e}")
    client = None

# -----------------------------
# System Status
# -----------------------------
def get_system_status():
    return {
        "vector_db_status": vector_db_status,
        "gemini_status": "initialized" if client else "not_initialized",
        "ready": vector_db is not None and len(vector_db) > 0 and client is not None
    }

# Helper to compute dot product (cosine similarity)
def dot_product(v1, v2):
    return sum(x * y for x, y in zip(v1, v2))

# -----------------------------
# Similarity Search (Pure Python)
# -----------------------------
def similarity_search(query: str, k: int = 4):
    if not client:
        raise Exception("Gemini client not initialized")
    if not vector_db:
        raise Exception("Vector database not loaded")

    # Embed the query
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=query
    )
    query_emb = response.embeddings[0].values

    # Score each chunk
    scored_chunks = []
    for item in vector_db:
        emb = item.get("embedding")
        if emb:
            sim = dot_product(query_emb, emb)
            scored_chunks.append((sim, item))

    # Sort descending by score
    scored_chunks.sort(key=lambda x: x[0], reverse=True)

    # Wrap in Document object structure for backwards compatibility
    docs = []
    for score, item in scored_chunks[:k]:
        docs.append(Document(
            page_content=item["text"],
            metadata=item.get("metadata", {})
        ))

    return docs

# -----------------------------
# Main Ask Function
# -----------------------------
def ask(question: str):
    print(f"[ASK] Question: {question}")

    if not vector_db:
        return "Vector database not initialized"

    if client is None:
        return "Gemini client not initialized"

    try:
        docs = similarity_search(question, k=4)
        print(f"[ASK] Retrieved {len(docs)} docs")

        if not docs:
            return "No matching information found"

        context = "\n".join([d.page_content for d in docs])

    except Exception as e:
        logging.exception(e)
        return f"Search error: {str(e)}"

    prompt = f"""
You are Christo's AI Portfolio Assistant.

Rules:
- Answer ONLY from provided context
- If answer unavailable say: I don't know
- Keep concise
- Be professional

Context:
{context}

Question:
{question}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        answer = response.text
        print(f"[ASK] Success: {len(answer)} chars")
        return answer
    except Exception as e:
        logging.exception(e)
        return f"Gemini generation error: {str(e)}"