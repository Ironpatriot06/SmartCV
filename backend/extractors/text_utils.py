"""Shared text normalization and line splitting."""

import re

from extractors.config import DATE_RANGE_PATTERN


def split_lines(text: str) -> list[str]:
    return [line.rstrip() for line in text.replace("\r\n", "\n").split("\n")]


def normalize_header(line: str) -> str:
    """Normalize a candidate header for exact/regex matching."""
    value = line.strip().lower()
    value = re.sub(r"[:#|•\-–—]+$", "", value).strip()
    value = re.sub(r"^\d+[\.\)]\s*", "", value)  # "1. Experience"
    value = re.sub(r"[^\w\s&/]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def is_likely_header_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped or len(stripped) > 80:
        return False
    if stripped.startswith(("-", "•", "*", "·")):
        return False
    if re.search(DATE_RANGE_PATTERN, stripped, re.IGNORECASE):
        return False
    # Mostly title-like: few words, often uppercase or title case.
    words = stripped.split()
    if len(words) > 8:
        return False
    alpha = re.sub(r"[^A-Za-z]", "", stripped)
    if alpha and alpha.isupper():
        return True
    if stripped.istitle():
        return True
    return len(words) <= 4


def clean_section_body(lines: list[str]) -> str:
    body = "\n".join(line.strip() for line in lines if line.strip())
    return re.sub(r"\n{3,}", "\n\n", body).strip()


def split_paragraphs(text: str) -> list[str]:
    chunks = re.split(r"\n\s*\n", text.strip())
    return [chunk.strip() for chunk in chunks if chunk.strip()]
