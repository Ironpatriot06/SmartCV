"""Deterministic keyword extraction for ATS scoring."""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass


@dataclass(frozen=True)
class ExtractedKeyword:
    keyword: str
    category: str
    count: int = 1


ACTION_VERBS = {
    "accelerated",
    "achieved",
    "architected",
    "automated",
    "built",
    "collaborated",
    "created",
    "delivered",
    "designed",
    "developed",
    "drove",
    "implemented",
    "improved",
    "increased",
    "launched",
    "led",
    "managed",
    "migrated",
    "optimized",
    "reduced",
    "shipped",
    "streamlined",
}

SOFT_SKILL_PHRASES = {
    "communication",
    "cross-functional",
    "leadership",
    "mentoring",
    "problem solving",
    "stakeholder management",
    "team collaboration",
}

TECH_HINTS = {
    "api",
    "aws",
    "azure",
    "ci/cd",
    "cloud",
    "docker",
    "fastapi",
    "graphql",
    "kubernetes",
    "machine learning",
    "microservices",
    "postgresql",
    "python",
    "react",
    "sql",
    "typescript",
}

DATABASE_HINTS = {
    "bigquery",
    "dynamodb",
    "elasticsearch",
    "mongodb",
    "mysql",
    "postgres",
    "postgresql",
    "redis",
    "snowflake",
    "sql server",
}

STOPWORDS = {
    "about",
    "across",
    "a",
    "also",
    "and",
    "are",
    "based",
    "business",
    "candidate",
    "company",
    "experience",
    "for",
    "from",
    "have",
    "including",
    "into",
    "job",
    "must",
    "need",
    "our",
    "role",
    "team",
    "that",
    "the",
    "this",
    "using",
    "we",
    "with",
    "work",
    "years",
}


def normalize_keyword(value: str) -> str:
    cleaned = re.sub(r"\s+", " ", value.replace("–", "-").strip(" .,:;()[]{}"))
    return cleaned.lower()


def keyword_label(value: str) -> str:
    value = value.strip()
    if not value:
        return value
    if value.isupper() or any(char in value for char in ("/", "#", "+")):
        return value
    return " ".join(part if part.isupper() else part.capitalize() for part in value.split())


def _categorize(keyword: str) -> str:
    key = normalize_keyword(keyword)
    if key in SOFT_SKILL_PHRASES:
        return "soft_skill"
    if key in ACTION_VERBS:
        return "action_verb"
    if key in DATABASE_HINTS or "database" in key:
        return "database"
    if key in TECH_HINTS:
        return "technology"
    if any(marker in keyword for marker in (".", "#", "+", "/", "-")):
        return "technology"
    if re.search(r"\b(framework|library|platform|tool|service|api)\b", key):
        return "tool"
    return "keyword"


def _candidate_phrases(text: str) -> list[str]:
    phrases: list[str] = []
    phrases.extend(re.findall(r"\b[A-Z][A-Za-z0-9+#./-]*(?:\s+[A-Z][A-Za-z0-9+#./-]*){0,3}\b", text))
    return phrases


def extract_keywords(text: str, max_keywords: int = 40) -> list[ExtractedKeyword]:
    """Extract likely ATS keywords without calling an AI model."""
    counter: Counter[str] = Counter()
    labels: dict[str, str] = {}

    for phrase in _candidate_phrases(text):
        key = normalize_keyword(phrase)
        if len(key) < 2 or key in STOPWORDS:
            continue
        words = key.split()
        if any(word in STOPWORDS for word in words):
            continue
        if len(words) > 3:
            continue
        if len(words) == 1 and key not in TECH_HINTS and key not in ACTION_VERBS and key not in DATABASE_HINTS:
            if not re.search(r"[A-Z0-9+#./-]", phrase):
                continue
        counter[key] += 1
        labels.setdefault(key, keyword_label(phrase))

    for phrase in SOFT_SKILL_PHRASES | TECH_HINTS | DATABASE_HINTS | ACTION_VERBS:
        matches = len(re.findall(rf"\b{re.escape(phrase)}\b", text, flags=re.IGNORECASE))
        if matches:
            counter[normalize_keyword(phrase)] += matches
            labels.setdefault(normalize_keyword(phrase), keyword_label(phrase))

    ranked = sorted(counter.items(), key=lambda item: (-item[1], len(item[0]), item[0]))
    return [
        ExtractedKeyword(keyword=labels[key], category=_categorize(labels[key]), count=count)
        for key, count in ranked[:max_keywords]
    ]


def keyword_presence(text: str, keywords: list[ExtractedKeyword]) -> tuple[list[ExtractedKeyword], list[ExtractedKeyword]]:
    haystack = normalize_keyword(text)
    matched: list[ExtractedKeyword] = []
    missing: list[ExtractedKeyword] = []
    for keyword in keywords:
        key = normalize_keyword(keyword.keyword)
        count = len(re.findall(rf"(?<![a-z0-9]){re.escape(key)}(?![a-z0-9])", haystack))
        item = ExtractedKeyword(keyword=keyword.keyword, category=keyword.category, count=count)
        if count:
            matched.append(item)
        else:
            missing.append(item)
    return matched, missing
