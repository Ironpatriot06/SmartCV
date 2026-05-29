import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.resumes import router as resumes_router
from db.mongodb import resume_collection
from api.routes.tailor import router as tailor_router
from api.routes.ats import router as ats_router
from api.routes.upload import router as upload_router
from db.mongodb import db  

# Load backend/.env so GEMINI_API_KEY is available when running uvicorn from backend/
load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(title="Resume Automator")


app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resumes_router)

app.include_router(upload_router)
from db.mongodb import resume_collection


app.include_router(tailor_router)
app.include_router(ats_router)
