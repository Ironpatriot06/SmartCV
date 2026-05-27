"""Assemble normalized hierarchical resume JSON."""

from extractors.structured.contact import parse_contact
from extractors.structured.education import parse_education
from extractors.structured.experience import parse_experience
from extractors.structured.projects import parse_projects
from extractors.structured.skills import parse_skills


def build_structured_resume(
    flat_sections: dict[str, str | None],
    meta: dict | None = None,
    contact_lines: list[str] | None = None,
) -> dict:
    summary = flat_sections.get("summary")
    payload: dict = {
        "contact": parse_contact(contact_lines or []),
        "summary": summary.strip() if summary else None,
        "experience": parse_experience(flat_sections.get("experience")),
        "education": parse_education(flat_sections.get("education")),
        "skills": parse_skills(flat_sections.get("skills")),
        "projects": parse_projects(flat_sections.get("projects")),
    }
    if meta:
        payload["_meta"] = meta
    return payload
