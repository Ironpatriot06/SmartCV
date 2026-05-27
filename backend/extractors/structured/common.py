"""Shared parsing primitives for structured section extraction."""

import re
from typing import Any

from extractors.config import DATE_RANGE_PATTERN

BULLET_RE = re.compile(r"^[\s]*(?:[-•*●○▪·]|\d+[\.\)])\s+")
URL_RE = re.compile(
    r"https?://[^\s]+|www\.[^\s]+|"
    r"(?:github\.com|gitlab\.com|linkedin\.com)/[^\s]+|"
    r"[a-zA-Z0-9][-a-zA-Z0-9]*\.(?:com|org|io|dev|net|edu|gov|app)(?:/[^\s]*)?",
    re.IGNORECASE,
)
FALSE_URL_SUFFIXES = (".js", ".ts", ".py", ".go", ".rb", ".cs")
DATE_RE = re.compile(DATE_RANGE_PATTERN, re.IGNORECASE)
MONTH_YEAR_RANGE_RE = re.compile(
    r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}"
    r"\s*[-–—to]+\s*(?:present|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)"
    r"[a-z]*\.?\s+\d{4}|\d{4})\b",
    re.IGNORECASE,
)
MONTH_YEAR_RE = re.compile(
    r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\b",
    re.IGNORECASE,
)
MONTH_ONLY_RE = re.compile(
    r"^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?$",
    re.IGNORECASE,
)
YEAR_ONLY_RE = re.compile(r"^\d{4}$")
LOCATION_RE = re.compile(
    r"^[A-Za-z][A-Za-z\s\.\-']+,\s*(?:[A-Z]{2}|[A-Za-z][A-Za-z\s]+)$"
)
DEGREE_RE = re.compile(
    r"\b("
    r"B\.?\s*S\.?|B\.?\s*A\.?|M\.?\s*S\.?|M\.?\s*A\.?|M\.?\s*B\.?A\.?|"
    r"Ph\.?\s*D\.?|Bachelor|Master|Associate|Doctor|Diploma|B\.?\s*Tech"
    r")\b",
    re.IGNORECASE,
)
COMPANY_SUFFIX_RE = re.compile(r"\b(inc\.?|llc|ltd\.?|corp\.?|co\.?|gmbh|plc)\b", re.I)
ROLE_AT_RE = re.compile(r"^(.+?)\s+at\s+(.+)$", re.I)
TITLE_KEYWORDS = re.compile(
    r"\b(engineer|developer|manager|analyst|intern|consultant|director|"
    r"architect|designer|lead|specialist|associate|coordinator)\b",
    re.I,
)


def split_lines(text: str) -> list[str]:
    return [line.strip() for line in text.splitlines() if line.strip()]


def is_bullet(line: str) -> bool:
    return bool(BULLET_RE.match(line))


def strip_bullet(line: str) -> str:
    return BULLET_RE.sub("", line).strip()


def extract_bullets(lines: list[str]) -> tuple[list[str], list[str]]:
    """Return (non_bullet_lines, bullet_texts)."""
    rest: list[str] = []
    bullets: list[str] = []
    for line in lines:
        if is_bullet(line):
            bullets.append(strip_bullet(line))
        else:
            rest.append(line)
    return rest, bullets


def find_date(text: str) -> str | None:
    stripped = text.strip()
    month_match = MONTH_YEAR_RANGE_RE.search(stripped)
    if month_match:
        return month_match.group(0).strip()
    single_month_match = MONTH_YEAR_RE.search(stripped)
    if single_month_match:
        return single_month_match.group(0).strip()
    if YEAR_ONLY_RE.fullmatch(stripped):
        return stripped
    if DATE_RE.fullmatch(stripped):
        return stripped
    matches = list(DATE_RE.finditer(stripped))
    if not matches:
        return None
    return max(matches, key=lambda match: len(match.group(0))).group(0).strip()


def remove_date(text: str) -> str:
    cleaned = DATE_RE.sub("", text)
    cleaned = MONTH_YEAR_RE.sub("", cleaned)
    if YEAR_ONLY_RE.fullmatch(cleaned.strip()):
        return ""
    return cleaned.strip(" ,–—-|")


def extract_urls(text: str) -> list[str]:
    urls: list[str] = []
    for match in URL_RE.finditer(text):
        url = match.group(0).rstrip(".,;)")
        if any(url.lower().endswith(suffix) for suffix in FALSE_URL_SUFFIXES):
            continue
        if not url.startswith("http"):
            url = "https://" + url
        if url not in urls:
            urls.append(url)
    return urls


def is_location(line: str) -> bool:
    stripped = line.strip()
    if not stripped or is_bullet(stripped):
        return False
    if DATE_RE.search(stripped):
        return False
    if stripped.lower() in {"remote", "hybrid", "on-site", "onsite"}:
        return True
    return bool(LOCATION_RE.match(stripped))


def split_entry_blocks(text: str) -> list[list[str]]:
    """
    Split section text into entry blocks using blank lines and date-line boundaries.
    """
    if not text or not text.strip():
        return []

    lines = split_lines(text)
    blocks: list[list[str]] = []
    current: list[str] = []

    def flush() -> None:
        nonlocal current
        if current:
            blocks.append(current)
            current = []

    for line in lines:
        if not current:
            current.append(line)
            continue
        prev_has_date = any(DATE_RE.search(item) for item in current)
        line_is_date_only = bool(DATE_RE.fullmatch(line.strip()))
        starts_new_entry = line_is_date_only and not prev_has_date
        if not starts_new_entry and prev_has_date and not is_bullet(line):
            last = current[-1]
            if (
                not is_bullet(last)
                and not DATE_RE.search(last)
                and TITLE_KEYWORDS.search(line)
                and COMPANY_SUFFIX_RE.search(last)
            ):
                starts_new_entry = True
        if starts_new_entry:
            flush()
        current.append(line)
    flush()

    if len(blocks) <= 1:
        return blocks

    merged: list[list[str]] = []
    for block in blocks:
        if merged and len(block) == 1 and DATE_RE.search(block[0]):
            merged[-1].append(block[0])
        else:
            merged.append(block)
    return merged


def parse_company_role(line: str) -> tuple[str, str]:
    """Parse 'Company — Role' or 'Role at Company' style header lines."""
    cleaned = line.strip()
    for sep in (" — ", " – ", " | ", " / "):
        if sep in cleaned:
            left, right = cleaned.split(sep, 1)
            left, right = left.strip(), right.strip()
            if TITLE_KEYWORDS.search(right) or not TITLE_KEYWORDS.search(left):
                return left, right
            if TITLE_KEYWORDS.search(left):
                return right, left
            return left, right

    if " - " in cleaned and not DATE_RE.search(cleaned):
        left, right = cleaned.split(" - ", 1)
        if TITLE_KEYWORDS.search(right):
            return left.strip(), right.strip()

    match = ROLE_AT_RE.match(cleaned)
    if match:
        return match.group(2).strip(), match.group(1).strip()

    if TITLE_KEYWORDS.search(cleaned):
        return "", cleaned
    return cleaned, ""


def empty_entry(fields: dict[str, Any]) -> dict[str, Any]:
    return {key: (value if value is not None else ([] if isinstance(value, list) else ""))
            for key, value in fields.items()}
