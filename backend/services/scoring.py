"""Reusable deterministic ATS scoring primitives."""

from __future__ import annotations

import re
from dataclasses import dataclass

from schemas.resume import ResumeData
from services.keyword_extractor import ACTION_VERBS, ExtractedKeyword, normalize_keyword


@dataclass(frozen=True)
class ScoreComponentResult:
    id: str
    label: str
    score: int
    weight: int
    rationale: str


def clamp_score(value: float) -> int:
    return max(0, min(100, round(value)))


def resume_to_text(resume: ResumeData) -> str:
    sections: list[str] = [resume.summary, " ".join(resume.skills)]
    for item in resume.experience:
        sections.extend([item.title, item.company, " ".join(item.bullets)])
    for item in resume.projects:
        sections.extend([item.name, item.description, " ".join(item.technologies), " ".join(item.bullets)])
    for item in resume.education:
        sections.extend([item.degree, item.field or "", item.institution, " ".join(item.highlights)])
    return "\n".join(part for part in sections if part)


def all_bullets(resume: ResumeData) -> list[str]:
    bullets: list[str] = []
    for item in resume.experience:
        bullets.extend(item.bullets)
    for item in resume.projects:
        bullets.extend(item.bullets)
    return [bullet.strip() for bullet in bullets if bullet.strip()]


def skills_match_score(matched: list[ExtractedKeyword], total_keywords: int) -> int:
    if total_keywords == 0:
        return 0
    weighted = sum(1.2 if item.category in {"technology", "database", "tool"} else 1 for item in matched)
    possible = total_keywords * 1.1
    return clamp_score((weighted / possible) * 100)


def relevance_score(resume: ResumeData, keywords: list[ExtractedKeyword], section: str) -> int:
    if not keywords:
        return 0
    if section == "experience":
        text = " ".join(" ".join(item.bullets + [item.title]) for item in resume.experience)
    else:
        text = " ".join(" ".join(item.bullets + item.technologies + [item.description, item.name]) for item in resume.projects)
    haystack = normalize_keyword(text)
    matched = sum(1 for item in keywords if normalize_keyword(item.keyword) in haystack)
    return clamp_score((matched / len(keywords)) * 100)


def keyword_density_score(resume_text: str, matched: list[ExtractedKeyword]) -> int:
    word_count = max(1, len(re.findall(r"\b\w+\b", resume_text)))
    keyword_hits = sum(item.count for item in matched)
    density = (keyword_hits / word_count) * 100
    if density < 0.8:
        return clamp_score(density / 0.8 * 70)
    if density <= 3.5:
        return 100
    return clamp_score(100 - ((density - 3.5) * 12))


def completeness_score(resume: ResumeData) -> int:
    checks = [
        bool(resume.contact.name.strip()),
        bool(resume.contact.email or resume.contact.phone),
        bool(resume.summary.strip()),
        len(resume.skills) >= 5,
        bool(resume.experience),
        any(item.bullets for item in resume.experience),
        bool(resume.education),
        bool(resume.projects),
    ]
    return clamp_score((sum(checks) / len(checks)) * 100)


def measurable_achievement_rate(resume: ResumeData) -> int:
    bullets = all_bullets(resume)
    if not bullets:
        return 0
    quantified = sum(1 for bullet in bullets if re.search(r"\d|%|\$|x\b|revenue|users|latency|cost", bullet, re.IGNORECASE))
    return clamp_score((quantified / len(bullets)) * 100)


def action_verb_rate(resume: ResumeData) -> int:
    bullets = all_bullets(resume)
    if not bullets:
        return 0
    strong = 0
    for bullet in bullets:
        first = re.sub(r"^[^A-Za-z]+", "", bullet).split(" ", 1)[0].lower()
        if first in ACTION_VERBS:
            strong += 1
    return clamp_score((strong / len(bullets)) * 100)


def readability_score(resume: ResumeData) -> int:
    bullets = all_bullets(resume)
    if not bullets:
        return 35
    lengths = [len(re.findall(r"\b\w+\b", bullet)) for bullet in bullets]
    good_lengths = sum(1 for length in lengths if 8 <= length <= 28)
    long_penalty = sum(1 for length in lengths if length > 35)
    return clamp_score(((good_lengths / len(lengths)) * 100) - (long_penalty * 8))


def formatting_score(resume: ResumeData) -> int:
    bullets = all_bullets(resume)
    if not bullets:
        return 40
    clean = sum(1 for bullet in bullets if len(bullet) <= 220 and "\n" not in bullet and not bullet.endswith(". ."))
    section_balance = 15 if resume.skills and resume.experience and resume.education else 0
    return clamp_score((clean / len(bullets)) * 85 + section_balance)


def build_components(
    resume: ResumeData,
    keywords: list[ExtractedKeyword],
    matched: list[ExtractedKeyword],
    resume_text: str,
) -> list[ScoreComponentResult]:
    return [
        ScoreComponentResult("skills", "Skills match", skills_match_score(matched, len(keywords)), 30, "Share of job keywords present in skills, experience, and projects."),
        ScoreComponentResult("experience", "Experience relevance", relevance_score(resume, keywords, "experience"), 22, "How well experience bullets reflect the job language."),
        ScoreComponentResult("projects", "Project relevance", relevance_score(resume, keywords, "projects"), 14, "How well projects and technologies support the target role."),
        ScoreComponentResult("density", "Keyword density", keyword_density_score(resume_text, matched), 12, "Healthy use of target terms without obvious stuffing."),
        ScoreComponentResult("completeness", "Section completeness", completeness_score(resume), 12, "Presence of core resume sections and enough detail."),
        ScoreComponentResult("quality", "Bullet quality", clamp_score((measurable_achievement_rate(resume) * 0.55) + (action_verb_rate(resume) * 0.45)), 10, "Use of action verbs and measurable achievements."),
    ]


def weighted_total(components: list[ScoreComponentResult]) -> int:
    total_weight = sum(component.weight for component in components) or 1
    return clamp_score(sum(component.score * component.weight for component in components) / total_weight)
