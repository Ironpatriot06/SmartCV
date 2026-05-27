"""Structured contact info extraction."""

from __future__ import annotations

import re

from extractors.structured.common import extract_urls, is_location

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\+?\d[\d\s().-]{7,}\d")
GITHUB_HANDLE_RE = re.compile(r"github\s*[:\-]?\s*([A-Za-z0-9_.-]{2,})", re.I)
LINKEDIN_HANDLE_RE = re.compile(r"linkedin\s*[:\-]?\s*([A-Za-z0-9_.-]{2,})", re.I)
NAME_WORD_RE = re.compile(r"[A-Za-z][A-Za-z'\-]+")


def _extract_handles(line: str) -> list[str]:
    links: list[str] = []
    github_match = GITHUB_HANDLE_RE.search(line)
    if github_match:
        handle = github_match.group(1).strip().strip("/")
        if handle and "github" not in handle.lower():
            links.append(f"https://github.com/{handle}")
    linkedin_match = LINKEDIN_HANDLE_RE.search(line)
    if linkedin_match:
        handle = linkedin_match.group(1).strip().strip("/")
        if handle and "linkedin" not in handle.lower():
            links.append(f"https://www.linkedin.com/in/{handle}")
    return links


def parse_contact(lines: list[str]) -> dict:
    if not lines:
        return {
            "name": "",
            "email": "",
            "phone": "",
            "location": "",
            "links": [],
        }

    emails: list[str] = []
    phones: list[str] = []
    links: list[str] = []
    location = ""

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        emails.extend(EMAIL_RE.findall(stripped))
        phones.extend(match.group(0).strip() for match in PHONE_RE.finditer(stripped))

        if not location and is_location(stripped):
            location = stripped

        urls = extract_urls(stripped)
        for url in urls:
            if url not in links:
                links.append(url)

        if ("github" in stripped.lower() or "linkedin" in stripped.lower()) and not urls:
            for url in _extract_handles(stripped):
                if url not in links:
                    links.append(url)

    name = ""
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if "@" in stripped or PHONE_RE.search(stripped):
            continue
        if extract_urls(stripped):
            continue
        if is_location(stripped):
            continue
        if len(stripped) > 60:
            continue
        words = NAME_WORD_RE.findall(stripped)
        if 1 <= len(words) <= 4:
            name = stripped
            break

    return {
        "name": name,
        "email": emails[0] if emails else "",
        "phone": phones[0] if phones else "",
        "location": location,
        "links": links,
    }
