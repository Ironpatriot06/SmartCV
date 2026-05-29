"""Professional deterministic ATS analysis service."""

from __future__ import annotations

from schemas.resume import AtsScoreResponse, KeywordMatch, ResumeData, ScoreComponent
from services.keyword_extractor import extract_keywords, keyword_presence
from services.scoring import (
    action_verb_rate,
    build_components,
    formatting_score,
    measurable_achievement_rate,
    readability_score,
    resume_to_text,
    weighted_total,
)


def _health_label(score: int) -> str:
    if score >= 85:
        return "Excellent"
    if score >= 72:
        return "Strong"
    if score >= 58:
        return "Needs focus"
    return "At risk"


def _keyword_model(items):
    return [KeywordMatch(keyword=item.keyword, category=item.category, count=item.count) for item in items]


def _recommendations(score: int, missing, metrics: dict[str, int | float | str]) -> tuple[list[str], list[str], list[str]]:
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendations: list[str] = []

    if score >= 75:
        strengths.append("Resume is well aligned to the target job description.")
    if metrics["measurableAchievementRate"] >= 45:
        strengths.append("Many bullets include measurable outcomes.")
    if metrics["actionVerbRate"] >= 60:
        strengths.append("Experience bullets open with strong action verbs.")
    if metrics["formattingQuality"] >= 85:
        strengths.append("Formatting appears ATS-friendly and consistent.")

    if missing:
        top_missing = ", ".join(item.keyword for item in missing[:6])
        weaknesses.append(f"Important job keywords are missing: {top_missing}.")
        recommendations.append(f"Add relevant missing keywords where truthful: {top_missing}.")
    if metrics["measurableAchievementRate"] < 40:
        weaknesses.append("Too few bullets include numbers, scale, or business impact.")
        recommendations.append("Quantify outcomes with metrics such as %, revenue, latency, users, cost, or time saved.")
    if metrics["actionVerbRate"] < 55:
        weaknesses.append("Several bullets start without strong action verbs.")
        recommendations.append("Rewrite weak bullets to start with verbs like built, led, optimized, automated, reduced, or delivered.")
    if metrics["readability"] < 70:
        recommendations.append("Tighten long bullets to one result-focused sentence with clear context and impact.")
    if metrics["formattingQuality"] < 80:
        recommendations.append("Keep bullets concise, remove awkward punctuation, and maintain consistent sections.")

    if not recommendations:
        recommendations.append("Fine-tune the top missing role terms and keep the resume concise before export.")

    return strengths, weaknesses, recommendations


def analyze_resume(resume: ResumeData, job_description: str) -> AtsScoreResponse:
    jd_keywords = extract_keywords(job_description)
    resume_text = resume_to_text(resume)
    matched, missing = keyword_presence(resume_text, jd_keywords)
    components = build_components(resume, jd_keywords, matched, resume_text)
    score = weighted_total(components)
    jd_match = round((len(matched) / len(jd_keywords)) * 100) if jd_keywords else 0

    metrics: dict[str, int | float | str] = {
        "keywordCount": len(jd_keywords),
        "matchedKeywordCount": len(matched),
        "missingKeywordCount": len(missing),
        "readability": readability_score(resume),
        "formattingQuality": formatting_score(resume),
        "measurableAchievementRate": measurable_achievement_rate(resume),
        "actionVerbRate": action_verb_rate(resume),
    }
    strengths, weaknesses, recommendations = _recommendations(score, missing, metrics)

    return AtsScoreResponse(
        score=score,
        jdMatchPercentage=jd_match,
        healthLabel=_health_label(score),
        matchedKeywords=_keyword_model(matched),
        missingKeywords=_keyword_model(missing),
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=recommendations,
        scoreBreakdown=[
            ScoreComponent(
                id=component.id,
                label=component.label,
                score=component.score,
                weight=component.weight,
                rationale=component.rationale,
            )
            for component in components
        ],
        metrics=metrics,
    )
