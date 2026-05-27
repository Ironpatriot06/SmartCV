"""Structured work experience extraction."""

import re

from extractors.structured.common import (
    COMPANY_SUFFIX_RE,
    DATE_RE,
    MONTH_ONLY_RE,
    TITLE_KEYWORDS,
    YEAR_ONLY_RE,
    extract_bullets,
    find_date,
    is_bullet,
    is_location,
    parse_company_role,
    remove_date,
    split_lines,
)

SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")


def parse_experience(text: str | None) -> list[dict]:
    if not text or not text.strip():
        return []

    entries: list[dict] = []
    for block in _split_experience_blocks(text):
        entry = _parse_block(block)
        if entry.get("company") or entry.get("role") or entry.get("bullets"):
            entries.append(entry)
    return entries


def _split_experience_blocks(text: str) -> list[list[str]]:
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
    if is_bullet(line) or DATE_RE.fullmatch(line.strip()):
        return False

    has_date = any(find_date(item) for item in current)
    has_bullets = any(is_bullet(item) for item in current)
    if not (has_date or has_bullets):
        return False

    header_like = (
        " | " in line
        or " — " in line
        or " – " in line
        or COMPANY_SUFFIX_RE.search(line)
        or (TITLE_KEYWORDS.search(line) and len(line) < 100)
    )
    return header_like


def _parse_block(lines: list[str]) -> dict:
    prose, bullets = extract_bullets(lines)

    duration = ""
    location = ""
    header_lines: list[str] = []

    date_index = next(
        (idx for idx, line in enumerate(prose) if find_date(line)),
        None,
    )
    location_index = next(
        (idx for idx, line in enumerate(prose) if is_location(line)),
        None,
    )
    header_end = None
    if date_index is not None or location_index is not None:
        header_end = max(
            idx for idx in (date_index, location_index) if idx is not None
        )
    elif prose:
        header_end = min(1, len(prose) - 1)

    header_slice = prose[: header_end + 1] if header_end is not None else []
    body_lines = prose[header_end + 1 :] if header_end is not None else []

    for line in header_slice:
        date = find_date(line)
        if date and not duration:
            duration = date
            remainder = remove_date(line)
            if remainder:
                header_lines.append(remainder)
            continue
        if is_location(line) and not location:
            location = line
            continue
        header_lines.append(line)

    header_lines = [
        line
        for line in header_lines
        if not MONTH_ONLY_RE.fullmatch(line.strip())
        and not YEAR_ONLY_RE.fullmatch(line.strip())
    ]

    company, role = "", ""
    if header_lines:
        company, role = parse_company_role(header_lines[0])
        if len(header_lines) > 1 and not role:
            _, role_candidate = parse_company_role(header_lines[1])
            role = role_candidate or header_lines[1]
        if len(header_lines) > 1 and not location and is_location(header_lines[-1]):
            location = header_lines[-1]

    if not company and header_lines:
        for line in header_lines[1:]:
            if not line or is_location(line) or DATE_RE.search(line):
                continue
            if COMPANY_SUFFIX_RE.search(line):
                company = line
                break
        if not company:
            for line in header_lines[1:]:
                if (
                    line
                    and not is_location(line)
                    and not DATE_RE.search(line)
                    and not TITLE_KEYWORDS.search(line)
                ):
                    company = line
                    break

    if not company and not role and len(header_lines) == 1:
        company = header_lines[0]

    if not duration:
        for line in header_slice or lines:
            date = find_date(line)
            if date:
                duration = date
                break

    if not bullets and body_lines:
        cleaned_body = [
            line.strip()
            for line in body_lines
            if line.strip() and not is_location(line) and not find_date(line)
        ]
        body_text = " ".join(cleaned_body).strip()
        if body_text:
            bullets = [
                sentence.strip()
                for sentence in SENTENCE_SPLIT_RE.split(body_text)
                if sentence.strip()
            ]

    return {
        "company": company,
        "role": role,
        "location": location,
        "duration": duration,
        "bullets": bullets,
    }
