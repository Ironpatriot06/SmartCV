"""Structured skills extraction with optional categorization."""

import re

from extractors.structured.common import split_lines

CATEGORY_RE = re.compile(r"^([A-Za-z][A-Za-z\s/&]+):\s*(.+)$")
KNOWN_CATEGORIES = {
    "languages": "Languages",
    "language": "Languages",
    "frameworks": "Frameworks",
    "framework": "Frameworks",
    "libraries": "Libraries",
    "tools": "Tools",
    "databases": "Databases",
    "database": "Databases",
    "cloud": "Cloud",
    "devops": "DevOps",
    "technologies": "Technologies",
    "technical skills": "Technical Skills",
    "soft skills": "Soft Skills",
    "skills": "General",
}


def _split_items(value: str) -> list[str]:
    parts = re.split(r"[,;|•·]", value)
    return [part.strip() for part in parts if part.strip()]


def parse_skills(text: str | None) -> dict:
    if not text or not text.strip():
        return {"categories": [], "items": []}

    categories: list[dict] = []
    items: list[str] = []

    for line in split_lines(text):
        match = CATEGORY_RE.match(line)
        if match:
            raw_name, raw_items = match.group(1).strip(), match.group(2).strip()
            key = raw_name.lower()
            name = KNOWN_CATEGORIES.get(key, raw_name.title())
            category_items = _split_items(raw_items)
            categories.append({"name": name, "items": category_items})
            items.extend(category_items)
            continue

        if line.lower().startswith("skills:"):
            items.extend(_split_items(line.split(":", 1)[1]))
            continue

        items.extend(_split_items(line))

    items = list(dict.fromkeys(items))
    if categories:
        return {"categories": categories, "items": items}
    return {"categories": [{"name": "General", "items": items}] if items else [], "items": items}
