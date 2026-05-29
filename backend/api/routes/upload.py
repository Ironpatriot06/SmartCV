from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from extractors import extract_resume_sections
from parsers.pdf import PdfParseError, extract_text

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    safe_filename = Path(file.filename).name.strip()
    if not safe_filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    save_path = UPLOAD_DIR / safe_filename
    save_path.write_bytes(contents)

    try:
        text = extract_text(str(save_path))
    except PdfParseError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    sections = extract_resume_sections(text)
    return {"filename": safe_filename, "text": text, "sections": sections}
