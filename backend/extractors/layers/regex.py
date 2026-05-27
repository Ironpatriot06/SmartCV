"""Layer 2: flexible regex matching for header variants."""

import re

from extractors.config import SECTION_HEADER_PATTERNS
from extractors.models import SectionBoundary
from extractors.text_utils import is_likely_header_line, normalize_header

_COMPILED: dict[str, list[re.Pattern[str]]] = {
    key: [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
    for key, patterns in SECTION_HEADER_PATTERNS.items()
}


def match_header_regex(normalized: str) -> str | None:
    for key, patterns in _COMPILED.items():
        for pattern in patterns:
            if pattern.search(normalized):
                return key
    return None


def find_regex_boundaries(
    lines: list[str],
    *,
    skip_line_indices: set[int],
) -> list[SectionBoundary]:
    boundaries: list[SectionBoundary] = []
    for index, line in enumerate(lines):
        if index in skip_line_indices:
            continue
        if not is_likely_header_line(line):
            continue
        normalized = normalize_header(line)
        key = match_header_regex(normalized)
        if key is None:
            continue
        boundaries.append(
            SectionBoundary(
                line_index=index,
                key=key,
                method="regex",
                raw_header=line.strip(),
            )
        )
    return boundaries
