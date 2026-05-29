from fastapi import APIRouter, HTTPException

from schemas.resume import AtsScoreRequest, AtsScoreResponse
from services.ats_service import analyze_resume

router = APIRouter()


@router.post("/ats/score", response_model=AtsScoreResponse)
async def ats_score_endpoint(body: AtsScoreRequest) -> AtsScoreResponse:
    job_description = body.jobDescription.strip()
    if not job_description:
        raise HTTPException(status_code=400, detail="jobDescription is required")
    return analyze_resume(body.resume, job_description)
