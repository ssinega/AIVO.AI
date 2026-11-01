# AIVOA.AI — FastAPI Backend & LangGraph Root Cause Analysis Engine

## Overview
This is the Python FastAPI backend for **AIVOA.AI**, an intelligent Root Cause Analysis (RCA) platform designed for Active Pharmaceutical Ingredients (API) manufacturing quality investigations.

It implements a structured **LangGraph StateGraph** pipeline using **Groq API** (`llama-3.3-70b-versatile`) and **PyMuPDF** for PDF document processing, with PostgreSQL / SQLite persistence via SQLAlchemy.

---

## System Architecture & LangGraph Pipeline

```
Raw Input (PDF / Text / Email)
       │
       ▼
[Node 1: extract_incident_information]
       │
       ▼
[Node 2: validate_extracted_information]
       │
       ▼
[Node 3: analyze_root_causes]
       │
       ▼
[Node 4: perform_five_whys]
       │
       ▼
[Node 5: perform_fishbone_analysis]
       │
       ▼
[Node 6: identify_evidence_gaps]
       │
       ▼
[Node 7: generate_capa_recommendations]
       │
       ▼
[Node 8: finalize_investigation]
```

---

## Environment Variables

Configure `.env` in the `backend/` directory:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/aivoa_db
FRONTEND_URL=http://localhost:3000
PORT=8000
```

---

## Local Setup & Execution

### Option A: Local Python Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Swagger API Docs will be available at: `http://localhost:8000/docs`

### Option B: Docker Container

```bash
cd backend
docker build -t aivoa-backend .
docker run -p 8000:8000 -e GROQ_API_KEY=your_key aivoa-backend
```

---

## Railway CLI Deployment

To deploy this backend to Railway without public GitHub repo triggers:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and create project
railway login
railway init

# Set secrets
railway variables set GROQ_API_KEY=gsk_your_groq_key
railway variables set DATABASE_URL=postgresql://user:pass@host:5432/db

# Deploy directly from local directory
railway up
```

---

## Main API Endpoints

- `GET /health`: Health status & Groq API key configuration check
- `POST /api/rca/process-text`: Process raw narrative or email input
- `POST /api/rca/process-document`: Extract and analyze PDF file input
- `POST /api/rca/save`: Save/update investigation record to DB
- `GET /api/rca/investigations`: List all saved investigations
- `GET /api/rca/investigations/{id}`: Retrieve single investigation detail
- `GET /api/capa`: List all CAPA items
- `POST /api/capa`: Create new CAPA item
- `PUT /api/capa/{id}`: Update CAPA status or details
- `GET /api/dashboard/metrics`: Summary statistics for dashboard charts
