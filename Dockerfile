# ── Stage 1: Build React frontend ──────────────────────────────
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --silent
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python backend ─────────────────────────────────────
FROM python:3.11-slim

# System deps for GDAL / rasterio
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin libgdal-dev gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY backend/ ./backend/
COPY data/     ./data/

# Copy built React app into Flask static folder
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Expose port
EXPOSE 5000

ENV FLASK_ENV=production
ENV PORT=5000

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "backend.api.app:app"]
