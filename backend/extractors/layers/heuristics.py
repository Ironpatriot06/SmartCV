"""Layer 3: content-based assignment for unstructured or headerless resumes."""

import re

from extractors.config import (
    CANONICAL_KEYS,
    DATE_RANGE_PATTERN,
    SECTION_KEYWORDS,
    SectionKey,
)
from extractors.models import ExtractionState
from extractors.text_utils import clean_section_body, split_paragraphs


def score_paragraph(paragraph: str) -> dict[str, float]:
    lower = paragraph.lower()
    scores: dict[str, float] = {key: 0.0 for key in CANONICAL_KEYS}

    for key, keywords in SECTION_KEYWORDS.items():
        for keyword in keywords:
            if keyword in lower:
                scores[key] += 1.0

    if re.search(DATE_RANGE_PATTERN, paragraph, re.IGNORECASE):
        scores[SectionKey.EXPERIENCE.value] += 2.5
        if any(token in lower for token in ("university", "college", "bachelor", "master", "gpa")):
            scores[SectionKey.EDUCATION.value] += 1.5
        else:
            scores[SectionKey.EXPERIENCE.value] += 1.0

    if re.search(r"\b(?:b\.?s\.?|b\.?a\.?|m\.?s\.?|ph\.?d)\b", lower):
        scores[SectionKey.EDUCATION.value] += 2.0

    comma_count = paragraph.count(",")
    line_count = max(paragraph.count("\n") + 1, 1)
    if comma_count >= 3 and line_count <= 6 and len(paragraph) < 600:
        scores[SectionKey.SKILLS.value] += 2.0

    if "github.com" in lower or re.search(r"\bproject\b", lower):
        scores[SectionKey.PROJECTS.value] += 1.5

    bullet_lines = len(re.findall(r"^[\-\*•·]", paragraph, re.MULTILINE))
    if bullet_lines >= 2:
        scores[SectionKey.EXPERIENCE.value] += 1.0

    return scores


def _best_section(scores: dict[str, float], min_score: float = 1.5) -> str | None:
    key, value = max(scores.items(), key=lambda item: item[1])
    if value < min_score:
        return None
    return key


def apply_heuristic_fill(
    state: ExtractionState,
    *,
    full_text: str,
    assigned_line_ranges: list[tuple[int, int]],
) -> None:
    """Assign paragraphs in unclaimed regions using keyword/date heuristics."""
    lines = full_text.splitlines()
    claimed = [False] * len(lines)
    for start, end in assigned_line_ranges:
        for i in range(start, min(end, len(claimed))):
            claimed[i] = True

    unclaimed_blocks: list[str] = []
    block: list[str] = []
    for index, line in enumerate(lines):
        if claimed[index]:
            if block:
                unclaimed_blocks.append("\n".join(block))
                block = []
            continue
        block.append(line)
    if block:
        unclaimed_blocks.append("\n".join(block))

    unclaimed_text = "\n\n".join(unclaimed_blocks).strip()
    if not unclaimed_text:
        return

    paragraphs = split_paragraphs(unclaimed_text)
    for paragraph in paragraphs:
        scores = score_paragraph(paragraph)
        key = _best_section(scores)
        if key is None:
            if SectionKey.SUMMARY.value not in state.sections and len(paragraph) < 500:
                state.set_section(SectionKey.SUMMARY.value, paragraph, "heuristic")
            continue
        state.set_section(key, paragraph, "heuristic")


def infer_preamble_summary(
    state: ExtractionState,
    lines: list[str],
    first_boundary_index: int,
) -> None:
    """Text before the first detected header is often a summary or title block."""
    if SectionKey.SUMMARY.value in state.sections:
        return
    end = first_boundary_index
    preamble = clean_section_body(lines[:end])
    if not preamble or len(preamble) < 40:
        return
    # Avoid treating contact-only blocks as summary.
    contact_lines = sum(
        1
        for line in lines[:end]
        if "@" in line or re.search(r"\d{3}[-.\s]?\d{3}", line)
    )
    if contact_lines >= 2:
        if len(preamble) < 120:
            return
    state.set_section(SectionKey.SUMMARY.value, preamble, "preamble")
