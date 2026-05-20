# Portfolio (Christo)

This repository contains a FastAPI backend and a Vite + React frontend for a personal portfolio.

Quick start (development):

1. Backend: create and activate Python virtualenv, then install dependencies:

```powershell
python -m venv myenv
myenv\Scripts\activate
pip install -r backend/requirements.txt
```

2. Run backend (development):

```powershell
# from repository root
cd backend
# run with reload for development
c:/path/to/python -m uvicorn backend.app:app --reload --port 8000
```

3. Frontend (development):

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

Production build & serve with backend:

1. Build frontend:

```bash
cd frontend
npm run build
```

This produces `frontend/dist`. The backend will automatically serve the built frontend under the `/frontend` path (e.g. `/frontend/index.html`).

2. Install backend requirements and run the server:

```bash
pip install -r backend/requirements.txt
# set environment variables as needed, for example:
# set GROQ_API_KEY=your_key_here
# optionally set VITE_API_URL in the frontend build to point to backend
uvicorn backend.app:app --host 0.0.0.0 --port 8000
```

Configuration:

- Frontend reads `VITE_API_URL` at build time to set the API base URL. Example:

```bash
# in frontend folder
VITE_API_URL=https://api.example.com npm run build
```

- Backend reads `.env` for `GROQ_API_KEY` (if you use the GROQ model). If no key is provided, RAG features fall back safely.

Notes:

- The RAG/vectorstore features are optional and may require heavy ML dependencies (`faiss`, `langchain_huggingface`, etc.). If you do not need them, you can omit installing them.
- Upload endpoints accept raw binary data; admin uploads can be done via the Admin page in the frontend or via `fetch` with `Content-Type: application/octet-stream` and `X-Filename` header for certificates.

If you want, I can:
- Create a `Dockerfile` + `docker-compose.yml` for one-command production deploy.
- Add CI scripts to build and test the project.
