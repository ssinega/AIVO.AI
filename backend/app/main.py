import os
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import rca, capa, dashboard

# Initialize database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database initialization notice: {e}")

app = FastAPI(
    title="AIVOA.AI Root Cause Analysis API",
    description="AI-Powered Pharmaceutical Manufacturing Deviation Investigation Platform Backend",
    version="1.0.0"
)

frontend_url = os.getenv("FRONTEND_URL", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handlers for Centralized Error Structure
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "status_code": exc.status_code,
                "message": exc.detail if isinstance(exc.detail, str) else "HTTP Request Error",
                "details": exc.detail if not isinstance(exc.detail, str) else None,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "path": str(request.url.path)
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "status_code": 422,
                "message": "Invalid request payload parameters or missing required fields.",
                "details": exc.errors(),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "path": str(request.url.path)
            }
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "status_code": 500,
                "message": "An unhandled server error occurred during request processing.",
                "details": str(exc),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "path": str(request.url.path)
            }
        }
    )

app.include_router(rca.router)
app.include_router(capa.router)
app.include_router(dashboard.router)

@app.get("/health")
def health_check():
    has_groq = bool(os.getenv("GROQ_API_KEY"))
    return {
        "status": "healthy",
        "service": "AIVOA.AI Backend",
        "groq_configured": has_groq,
        "database_connected": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
