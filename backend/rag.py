from dotenv import load_dotenv
import os
import logging
import google.generativeai as genai

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load .env
load_dotenv()

# Use absolute path for deployment safety
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"[INIT] BASE_DIR: {BASE_DIR}")

vector_db = None
client = None
vector_db_status = "not_initialized"

# -----------------------------
# Initialize Vector DB
# -----------------------------
try:
    vs_path = os.path.join(BASE_DIR, "vectorstore")
    vs_index = os.path.join(vs_path, "index.faiss")
    vs_pkl = os.path.join(vs_path, "index.pkl")

    print(f"[VECTOR_DB] Vector store path: {vs_path}")
    print(f"[VECTOR_DB] Index path: {vs_index}")
    print(f"[VECTOR_DB] Index exists: {os.path.exists(vs_index)}")
    print(f"[VECTOR_DB] PKL exists: {os.path.exists(vs_pkl)}")

    if os.path.exists(vs_index) and os.path.exists(vs_pkl):
        print("[VECTOR_DB] Loading embeddings...")

        from langchain_community.vectorstores import FAISS
        from langchain_huggingface import HuggingFaceEmbeddings

        embedding = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        print("[VECTOR_DB] Loading FAISS index...")

        vector_db = FAISS.load_local(
            vs_path,
            embedding,
            allow_dangerous_deserialization=True
        )

        vector_db_status = "loaded"
        print("[VECTOR_DB] ✓ Vector database loaded successfully")
        logging.info("Vector database initialized successfully")

    else:
        vector_db_status = "missing_files"
        missing = []
        if not os.path.exists(vs_index):
            missing.append("index.faiss")
        if not os.path.exists(vs_pkl):
            missing.append("index.pkl")
        
        print(f"[VECTOR_DB] ✗ Vectorstore files missing: {', '.join(missing)}")
        logging.warning(f"Vectorstore files missing: {', '.join(missing)}")
        
        # Try to rebuild from data
        print("[VECTOR_DB] Attempting to rebuild vectorstore from data...")
        try:
            from utils.pdf_loader import load_pdfs
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            from langchain_community.vectorstores import FAISS
            from langchain_huggingface import HuggingFaceEmbeddings
            
            data_path = os.path.join(BASE_DIR, "data")
            pdf_files = [f for f in os.listdir(data_path) if f.endswith(".pdf")]
            
            if pdf_files:
                print(f"[VECTOR_DB] Found {len(pdf_files)} PDF files")
                full_paths = [os.path.join(data_path, f) for f in pdf_files]
                
                docs = load_pdfs(full_paths)
                print(f"[VECTOR_DB] Loaded {len(docs)} documents")
                
                splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200
                )
                
                chunks = splitter.split_documents(docs)
                print(f"[VECTOR_DB] Created {len(chunks)} chunks")
                
                embedding = HuggingFaceEmbeddings(
                    model_name="sentence-transformers/all-MiniLM-L6-v2"
                )
                
                vector_db = FAISS.from_documents(chunks, embedding)
                vector_db.save_local(vs_path)
                
                vector_db_status = "rebuilt"
                print("[VECTOR_DB] ✓ Vectorstore rebuilt and saved")
                logging.info("Vectorstore rebuilt from data")
            else:
                print("[VECTOR_DB] No PDF files found in data directory")
                
        except Exception as rebuild_error:
            logging.exception(f"[VECTOR_DB] Failed to rebuild vectorstore: {rebuild_error}")
            print(f"[VECTOR_DB] Could not rebuild: {str(rebuild_error)}")

except Exception as e:
    vector_db_status = "error"
    logging.exception(f"[VECTOR_DB] Failed to initialize vector database: {e}")
    print(f"[VECTOR_DB] ✗ Initialization error: {str(e)}")
    vector_db = None


# -----------------------------
# Initialize Gemini
# -----------------------------
try:

    api_key = os.getenv("GEMINI_API_KEY")

    if api_key:

        genai.configure(
            api_key=api_key
        )

        client = genai.GenerativeModel(
            "gemini-1.5-pro"
        )

        print("[GEMINI] ✓ Gemini initialized")
        logging.info("Gemini API initialized successfully")

    else:

        print("[GEMINI] ✗ No GEMINI_API_KEY found")
        logging.error("GEMINI_API_KEY not set in environment")
        client = None

except Exception as e:

    logging.exception(f"[GEMINI] Failed to initialize Gemini: {e}")
    print(f"[GEMINI] ✗ Initialization error: {str(e)}")
    client = None


# Status endpoint helper
def get_system_status():
    """Returns system initialization status"""
    return {
        "vector_db_status": vector_db_status,
        "gemini_status": "initialized" if client else "not_initialized",
        "ready": vector_db is not None and client is not None
    }


# Main Ask Function
# ​​​​------------------------------
def ask(question: str):

    print(f"[ASK] Processing question: {question}")
    
    # Check vector database
    if vector_db is None:
        if vector_db_status == "missing_files":
            error_msg = "Vector database not found - vectorstore files missing on server"
            logging.error(error_msg)
            return error_msg
        elif vector_db_status == "error":
            error_msg = "Vector database initialization failed"
            logging.error(error_msg)
            return error_msg
        else:
            error_msg = "Vector database not initialized"
            logging.error(error_msg)
            return error_msg

    # Check Gemini client
    if client is None:
        error_msg = "Gemini AI client not initialized - API key issue"
        logging.error(error_msg)
        return error_msg

    try:
        print("[ASK] Searching for relevant documents...")
        
        docs = vector_db.similarity_search(
            question,
            k=4
        )

        print(f"[ASK] Retrieved {len(docs)} documents")

        if len(docs) == 0:
            msg = "No matching information found in knowledge base"
            logging.info(msg)
            return msg

        context = "\n".join(
            [d.page_content for d in docs]
        )

        print(f"[ASK] Context length: {len(context)} characters")

    except Exception as e:
        error_msg = f"Document search error: {str(e)}"
        logging.exception(error_msg)
        print(f"[ASK] ✗ {error_msg}")
        return error_msg

    prompt = f"""
You are Christo's AI Portfolio Assistant.

Rules:
- Answer ONLY from the provided context
- If information is not in context, say: "I don't know"
- Keep responses concise and professional
- Format responses clearly

Context:
{context}

Question:
{question}
"""

    try:
        print("[ASK] Generating response with Gemini...")
        
        response = client.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3
            )
        )

        answer = response.text

        print(f"[ASK] ✓ Response generated ({len(answer)} characters)")
        logging.info(f"Successfully answered question")

        return answer

    except Exception as e:
        error_msg = f"Gemini generation error: {str(e)}"
        logging.exception(error_msg)
        print(f"[ASK] ✗ {error_msg}")
        return error_msg