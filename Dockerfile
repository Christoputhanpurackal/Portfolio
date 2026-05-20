# Multi-stage Dockerfile: builds frontend and runs backend

# 1) Frontend builder
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
COPY frontend/ .
RUN npm ci
RUN npm run build

# 2) Backend runtime
FROM python:3.12-slim
WORKDIR /app
# System deps
RUN apt-get update && apt-get install -y gcc libpq-dev build-essential && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY backend/ ./backend/
# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Install python deps
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

ENV PYTHONUNBUFFERED=1

EXPOSE 8000
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
