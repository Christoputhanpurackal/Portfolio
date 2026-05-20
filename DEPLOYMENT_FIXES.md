# Deployment Fixes for Vector Database Loading

## Problem
The chatbot was returning "Vector database not loaded" after deployment on Render while working locally.

## Root Causes
1. **Relative path issues** - Using `os.path.dirname(__file__)` doesn't work reliably in all environments
2. **Missing dependencies** - Required packages not listed in `requirements.txt`
3. **No deployment monitoring** - No way to diagnose issues in production
4. **No error context** - Generic error messages without system status

## Solutions Implemented

### 1. Deployment-Safe Path Resolution
```python
# OLD - Fragile on some systems
BASE_DIR = os.path.dirname(__file__)

# NEW - Absolute path for reliability
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
```

### 2. Comprehensive Debug Logging
Added prefixed logging for easier debugging:
```
[INIT] BASE_DIR: /app/backend
[VECTOR_DB] Vector store path: /app/backend/vectorstore
[VECTOR_DB] Index exists: True
[VECTOR_DB] ✓ Vector database loaded successfully
[GEMINI] ✓ Gemini initialized
[ASK] Processing question: Tell me about Christo
```

### 3. System Health Check Endpoint
New endpoint `/health` to monitor deployment status:
```bash
curl https://your-app.onrender.com/health
```

Response:
```json
{
  "status": "healthy",
  "vector_db": "loaded",
  "gemini_api": "initialized",
  "ready": true,
  "timestamp": "2026-05-20T13:52:38.731000"
}
```

### 4. Required Dependencies in requirements.txt
```
langchain_community
langchain_huggingface
faiss-cpu
```

### 5. Vectorstore Files Tracked in Git
```bash
git ls-files backend/vectorstore/
# Output:
# backend/vectorstore/index.faiss
# backend/vectorstore/index.pkl
```

### 6. Auto-Rebuild Capability
If vectorstore files are missing, the system automatically attempts to rebuild from source data:
```python
if not os.path.exists(vs_index):
    # Try to rebuild from PDFs in backend/data/
```

### 7. Clear Error Messages
```python
"Vector database not found - vectorstore files missing on server"
"Vector database initialization failed"
"Gemini AI client not initialized - API key issue"
"Document search error: {error}"
"Gemini generation error: {error}"
```

## Deployment Checklist

- [x] Update `BASE_DIR` to use `os.path.abspath()`
- [x] Add debug logging with status prefixes
- [x] Create `get_system_status()` function
- [x] Add `/health` endpoint
- [x] Update `requirements.txt` with all dependencies
- [x] Verify `.gitignore` does NOT exclude vectorstore
- [x] Confirm vectorstore files in git: `git ls-files backend/vectorstore/`
- [x] Test locally: `python -c "import rag; print(rag.get_system_status())"`

## Monitoring in Production

### Check Vector DB Status
```bash
# On Render shell
curl http://localhost:8000/health
```

### View Logs
Render automatically streams logs from:
- `[VECTOR_DB]` - Vector database initialization
- `[GEMINI]` - LLM API status
- `[ASK]` - Chat request processing

### Debug Commands
```bash
# Test imports
python -c "import rag; import langchain_community; import faiss"

# Check paths
python -c "import rag; print(rag.BASE_DIR)"

# Test chat
python -c "import rag; print(rag.get_system_status())"
```

## Expected Output After Fix

```
[INIT] BASE_DIR: /app/backend
[VECTOR_DB] Vector store path: /app/backend/vectorstore
[VECTOR_DB] Index path: /app/backend/vectorstore/index.faiss
[VECTOR_DB] Index exists: True
[VECTOR_DB] PKL exists: True
[VECTOR_DB] Loading embeddings...
[VECTOR_DB] Loading FAISS index...
[VECTOR_DB] ✓ Vector database loaded successfully
[GEMINI] ✓ Gemini initialized
Health check: {"status": "healthy", "ready": true}
Chat working: [ASK] ✓ Response generated (245 characters)
```

## Troubleshooting

### "Vector database not found"
1. Check `/health` endpoint
2. Verify files exist: `git ls-files backend/vectorstore/`
3. Check Render file system hasn't pruned files
4. Manually trigger rebuild from admin panel

### "Gemini not initialized"
1. Verify `GEMINI_API_KEY` in Render environment variables
2. Check API key is valid for Gemini API (not Google Cloud)
3. Verify model name is correct: `gemini-1.5-pro`

### Import errors
1. Check `requirements.txt` includes: `langchain_community`, `langchain_huggingface`, `faiss-cpu`
2. Rebuild Docker image or restart dyno on Render

## Files Modified
- `backend/rag.py` - Main RAG initialization and chat function
- `backend/app.py` - Added `/health` endpoint
- `backend/requirements.txt` - Uncommented required dependencies

## Testing Locally
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Test imports
python -c "from rag import ask, get_system_status; print(get_system_status())"

# 3. Test chat
python -c "from rag import ask; print(ask('Tell me about Christo'))"

# 4. Start server
cd backend && uvicorn app:app --reload
# Visit http://localhost:8000/health
```
