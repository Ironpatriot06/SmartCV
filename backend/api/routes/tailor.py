from fastapi import APIRouter, HTTPException

from schemas.resume import TailorRequest, TailorResponse
from services.tailoring_service import tailor_resume

router = APIRouter()


@router.post("/tailor", response_model=TailorResponse)
async def tailor_endpoint(body: TailorRequest) -> TailorResponse:
    job_description = body.jobDescription.strip()
    if not job_description:
        raise HTTPException(status_code=400, detail="jobDescription is required")

    try:
        tailored = await tailor_resume(body.resume, job_description)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Resume tailoring failed. Please try again.",
        ) from exc

    return TailorResponse(tailoredResume=tailored)
