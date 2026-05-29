from fastapi import APIRouter, HTTPException

from db.resume_repository import (
    create_resume,
    delete_resume,
    list_resumes,
    get_resume,
)
from schemas.resume import (
    ResumeCreateRequest,
    ResumeCreateResponse,
    ResumeDeleteResponse,
    ResumeRecord,
    ResumeSummary,
)

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("", response_model=list[ResumeSummary])
async def get_all_resumes():
    return await list_resumes()


@router.get("/{resume_id}", response_model=ResumeRecord)
async def get_resume_by_id(resume_id: str):
    try:
        resume = await get_resume(resume_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    return resume


@router.post("", response_model=ResumeCreateResponse)
async def create_resume_endpoint(body: ResumeCreateRequest):
    resume_id = await create_resume(body.name, body.resume_data.model_dump())

    return ResumeCreateResponse(id=resume_id)


@router.delete("/{resume_id}", response_model=ResumeDeleteResponse)
async def delete_resume_by_id(resume_id: str):
    try:
        deleted = await delete_resume(resume_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not deleted:
        raise HTTPException(status_code=404, detail="Resume not found")

    return ResumeDeleteResponse(deleted=True)