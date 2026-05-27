"""Structured education extraction."""

import re

from extractors.structured.common import (
    DEGREE_RE,
    extract_bullets,
    find_date,
    is_bullet,
    is_location,
    remove_date,
    split_lines,
)

INSTITUTION_HINT_RE = re.compile(
    r"\b(university|college|institute|school|academy|polytechnic|conservatory)\b",
    re.IGNORECASE,
)


def parse_education(text: str | None) -> list[dict]:
    if not text or not text.strip():
        return []

    entries: list[dict] = []
    for block in _split_education_blocks(text) or [split_lines(text)]:
        entry = _parse_block(block)
        if entry.get("institution") or entry.get("degree"):
            entries.append(entry)
    return entries


def _split_education_blocks(text: str) -> list[list[str]]:
    lines = split_lines(text)
    blocks: list[list[str]] = []
    current: list[str] = []

    for line in lines:
        if _starts_new_entry(line, current):
            if current:
                blocks.append(current)
            current = [line]
        else:
            current.append(line)
    if current:
        blocks.append(current)
    return blocks


def _starts_new_entry(line: str, current: list[str]) -> bool:
    if not current:
        return False
    if is_bullet(line):
        return False

    current_has_date = any(find_date(item) for item in current)
    current_has_degree = any(DEGREE_RE.search(item) for item in current)
    current_has_institution = any(INSTITUTION_HINT_RE.search(item) for item in current)

    line_has_date = bool(find_date(line))
    line_has_degree = bool(DEGREE_RE.search(line))
    line_has_institution = bool(INSTITUTION_HINT_RE.search(line))

    if line_has_institution and (current_has_institution or current_has_degree or current_has_date):
        return True
    if line_has_degree and current_has_degree and (current_has_institution or current_has_date):
        return True
    if line_has_date and current_has_date and not is_location(line):
        return True

    return False


def _parse_block(lines: list[str]) -> dict:
    prose, _bullets = extract_bullets(lines)

    dates = ""
    location = ""
    degree = ""
    institution = ""

    for line in prose:
        date = find_date(line)
        if date and not dates:
            dates = date
            line = remove_date(line)
            if not line:
                continue
        if is_location(line) and not location:
            location = line
            continue
        if DEGREE_RE.search(line) and not degree:
            degree = line
            continue
        if not institution:
            institution = line
        elif not degree:
            degree = line
        elif not location and is_location(line):
            location = line

    if institution and degree and DEGREE_RE.search(institution) and not DEGREE_RE.search(degree):
        institution, degree = degree, institution

    return {
        "institution": institution,
        "degree": degree,
        "location": location,
        "dates": dates,
    }
