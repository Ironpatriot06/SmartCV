"""Layer 1: exact synonym matching on normalized header lines."""

from extractors.config import SECTION_SYNONYMS
from extractors.models import SectionBoundary
from extractors.text_utils import is_likely_header_line, normalize_header


def find_exact_boundaries(lines: list[str]) -> list[SectionBoundary]:
    boundaries: list[SectionBoundary] = []
    for index, line in enumerate(lines):
        if not is_likely_header_line(line):
            continue
        normalized = normalize_header(line)
        key = SECTION_SYNONYMS.get(normalized)
        if key is None:
            continue
        boundaries.append(
            SectionBoundary(
                line_index=index,
                key=key,
                method="exact",
                raw_header=line.strip(),
            )
        )
    return boundaries
