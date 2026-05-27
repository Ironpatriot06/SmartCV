"""Structured project extraction."""

import re

from extractors.structured.common import (
    extract_bullets,
    extract_urls,
    is_bullet,
    remove_date,
    split_lines,
)

TECH_SPLIT_RE = re.compile(r"[,;|/]")
TECH_LABEL_RE = re.compile(r"^(technologies|tech stack|stack|tools)\s*:\s*", re.I)
HEADER_SEP_RE = re.compile(r"\s[—–|]\s")


def parse_projects(text: str | None) -> list[dict]:
    if not text or not text.strip():
        return []

    entries: list[dict] = []
    for block in _split_project_blocks(text):
        entry = _parse_block(block)
        if entry.get("name") or entry.get("bullets") or entry.get("links"):
            entries.append(entry)
    return entries


def _split_project_blocks(text: str) -> list[list[str]]:
    lines = split_lines(text)
    blocks: list[list[str]] = []
    current: list[str] = []

    for line in lines:
        if _starts_new_project(line, current):
            if current:
                blocks.append(current)
            current = [line]
        else:
            current.append(line)
    if current:
        blocks.append(current)
    return blocks


def _starts_new_project(line: str, current: list[str]) -> bool:
    if not current:
        return False
    if is_bullet(line):
        return False
    has_bullets = any(is_bullet(item) for item in current)
    if not has_bullets:
        return False
    return bool(HEADER_SEP_RE.search(line) or extract_urls(line))


def _parse_technologies(text: str) -> list[str]:
    cleaned = TECH_LABEL_RE.sub("", text).strip()
    items = [item.strip() for item in TECH_SPLIT_RE.split(cleaned) if item.strip()]
    return items


def _parse_block(lines: list[str]) -> dict:
    prose, bullets = extract_bullets(lines)
    links: list[str] = []
    technologies: list[str] = []
    name = ""

    for line in prose:
        line_links = extract_urls(line)
        if line_links:
            links.extend(line_links)
            line = " ".join(
                part for part in line.split() if not any(url in part for url in line_links)
            ).strip()

        if TECH_LABEL_RE.search(line):
            technologies.extend(_parse_technologies(line))
            continue

        if not name and line:
            if HEADER_SEP_RE.search(line):
                name_part, tech_part = HEADER_SEP_RE.split(line, maxsplit=1)
                name = remove_date(name_part.strip())
                technologies.extend(_parse_technologies(tech_part))
            elif "," in line and len(line) < 120:
                name = remove_date(line.split(",", 1)[0].strip())
                technologies.extend(_parse_technologies(line))
            else:
                name = remove_date(line)
        elif line:
            technologies.extend(_parse_technologies(line))

    for bullet in bullets:
        links.extend(extract_urls(bullet))

    return {
        "name": name,
        "technologies": list(dict.fromkeys(technologies)),
        "bullets": bullets,
        "links": list(dict.fromkeys(links)),
    }
