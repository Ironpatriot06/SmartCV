from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from extractors import extract_resume_sections
from parsers.pdf import extract_text

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    save_path = UPLOAD_DIR / file.filename
    save_path.write_bytes(await file.read())

    text = extract_text(str(save_path))
    sections = extract_resume_sections(text)
    return {"filename": file.filename, "text": text, "sections": sections}
