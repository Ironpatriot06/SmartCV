"""
Single-request resume tailoring orchestration.

Strategy (hallucination prevention):
1. One model request for the full resume to reduce latency and simplify API usage.
2. Immutable fields (company, title, dates, technologies) are never taken from model output.
3. Parsed JSON is validated and merged with the original item before returning.
4. On parse/validation failure, the original content is kept unchanged.
"""

from __future__ import annotations

import copy
import logging

from schemas.resume import ExperienceItem, ProjectItem, ResumeData
from services import gemini_service, prompts

logger = logging.getLogger(__name__)


def _normalize_skill(skill: str) -> str:
    return skill.strip().lower()


def _filter_skills_to_original(
    proposed: list[str],
    original: list[str],
) -> list[str]:
    """Only allow skills that match the original list (case-insensitive)."""
    if not original:
        return []
    allowed = {_normalize_skill(s): s for s in original if s.strip()}
    result: list[str] = []
    seen: set[str] = set()
    for skill in proposed:
        key = _normalize_skill(skill)
        if key in allowed and key not in seen:
            seen.add(key)
            result.append(allowed[key])
    # Append any original skills the model dropped (never lose skills silently)
    for key, original_label in allowed.items():
        if key not in seen:
            result.append(original_label)
    return result


def _coerce_bullets(
    proposed: list | None,
    original: list[str],
) -> list[str]:
    if not isinstance(proposed, list):
        return original
    cleaned = [str(b).strip() for b in proposed if str(b).strip()]
    if not cleaned:
        return original
    if len(cleaned) > len(original):
        return original
    return cleaned


def _merge_experience(
    original: list[ExperienceItem],
    proposed: list | None,
) -> list[ExperienceItem]:
    if not isinstance(proposed, list):
        return original
    proposed_by_id = {
        str(item.get("id")): item
        for item in proposed
        if isinstance(item, dict) and item.get("id")
    }
    merged: list[ExperienceItem] = []
    for item in original:
        proposed_item = proposed_by_id.get(item.id)
        bullets = (
            _coerce_bullets(proposed_item.get("bullets"), item.bullets)
            if isinstance(proposed_item, dict)
            else item.bullets
        )
        merged.append(item.model_copy(update={"bullets": bullets}))
    return merged


def _merge_projects(
    original: list[ProjectItem],
    proposed: list | None,
) -> list[ProjectItem]:
    if not isinstance(proposed, list):
        return original
    proposed_by_id = {
        str(item.get("id")): item
        for item in proposed
        if isinstance(item, dict) and item.get("id")
    }
    merged: list[ProjectItem] = []
    for item in original:
        proposed_item = proposed_by_id.get(item.id)
        if isinstance(proposed_item, dict):
            description = proposed_item.get("description")
            new_description = (
                str(description).strip()
                if isinstance(description, str) and str(description).strip()
                else item.description
            )
            bullets = _coerce_bullets(proposed_item.get("bullets"), item.bullets)
        else:
            new_description = item.description
            bullets = item.bullets
        merged.append(
            item.model_copy(
                update={
                    "description": new_description,
                    "bullets": bullets,
                },
            )
        )
    return merged


async def tailor_resume(resume: ResumeData, job_description: str) -> ResumeData:
    """
    Tailor the resume in a single model request.

    Education is passed through unchanged — typically factual and low ROI for rewording.
    """
    job_description = job_description.strip()
    base = copy.deepcopy(resume)
    parsed = await gemini_service.generate_json(
        prompts.full_resume_prompt(base, job_description),
    )
    if not parsed:
        logger.warning("Resume tailoring failed; keeping original")
        return base

    summary = parsed.get("summary")
    new_summary = (
        str(summary).strip()
        if isinstance(summary, str) and str(summary).strip()
        else base.summary
    )

    experience = _merge_experience(base.experience, parsed.get("experience"))
    projects = _merge_projects(base.projects, parsed.get("projects"))

    skills_raw = parsed.get("skills")
    proposed_skills = (
        [str(s).strip() for s in skills_raw if str(s).strip()]
        if isinstance(skills_raw, list)
        else base.skills
    )
    skills = _filter_skills_to_original(proposed_skills, base.skills)

    return base.model_copy(
        update={
            "summary": new_summary,
            "experience": experience,
            "projects": projects,
            "skills": skills,
        },
    )
