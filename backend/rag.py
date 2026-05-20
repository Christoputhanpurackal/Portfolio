from dotenv import load_dotenv
import os
import logging
from google import genai
from functools import lru_cache

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load .env
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"[INIT] BASE_DIR: {BASE_DIR}")

vector_db = None
client = None
vector_db_status = "not_initialized"


# -----------------------------
# Initialize Vector DB
# -----------------------------
@lru_cache
def load_vector_db():

    vs_path = os.path.join(BASE_DIR, "vectorstore")
    vs_index = os.path.join(vs_path, "index.faiss")
    vs_pkl = os.path.join(vs_path, "index.pkl")

    print(f"[VECTOR_DB] Vector store path: {vs_path}")
    print(f"[VECTOR_DB] Index exists: {os.path.exists(vs_index)}")
    print(f"[VECTOR_DB] PKL exists: {os.path.exists(vs_pkl)}")

    if not (os.path.exists(vs_index) and os.path.exists(vs_pkl)):
        raise Exception("Vectorstore files missing")

    from langchain_community.vectorstores import FAISS
    from langchain_huggingface import HuggingFaceEmbeddings

    print("[VECTOR_DB] Loading embeddings...")

    embedding = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    print("[VECTOR_DB] Loading FAISS...")

    db = FAISS.load_local(
        vs_path,
        embedding,
        allow_dangerous_deserialization=True
    )

    print("[VECTOR_DB] ✓ Loaded successfully")

    return db


try:

    vector_db = load_vector_db()
    vector_db_status = "loaded"

except Exception as e:

    vector_db_status = "error"
    logging.exception(e)
    print(f"[VECTOR_DB] ERROR: {e}")



# -----------------------------
# Initialize Gemini
# -----------------------------

try:

    api_key = os.getenv("GEMINI_API_KEY")

    if api_key:

        client = genai.Client(
            api_key=api_key
        )

        print("[GEMINI] ✓ Gemini initialized")
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

        "gemini_status":
        "initialized" if client else "not_initialized",

        "ready":
        vector_db is not None and client is not None
    }



# -----------------------------
# Main Ask Function
# -----------------------------

def ask(question: str):

    print(f"[ASK] Question: {question}")

    if vector_db is None:
        return "Vector database not initialized"

    if client is None:
        return "Gemini client not initialized"

    try:

        docs = vector_db.similarity_search(
            question,
            k=4
        )

        print(
            f"[ASK] Retrieved {len(docs)} docs"
        )

        if not docs:
            return "No matching information found"

        context = "\n".join(
            [d.page_content for d in docs]
        )

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

        print(
            f"[ASK] Success: {len(answer)} chars"
        )

        return answer

    except Exception as e:

        logging.exception(e)

        return f"Gemini generation error: {str(e)}"