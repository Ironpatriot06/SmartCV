"""Orchestrates layered section extraction."""

from extractors.config import CANONICAL_KEYS
from extractors.layers.exact import find_exact_boundaries
from extractors.layers.heuristics import (
    apply_heuristic_fill,
    infer_preamble_summary,
    score_paragraph,
)
from extractors.layers.regex import find_regex_boundaries
from extractors.models import ExtractionState, SectionBoundary
from extractors.config import SectionKey
from extractors.text_utils import clean_section_body, split_lines, split_paragraphs


def _infer_summary_from_lead(state: ExtractionState, text: str) -> None:
    if SectionKey.SUMMARY.value in state.sections:
        return
    for paragraph in split_paragraphs(text):
        if len(paragraph) > 600 or len(paragraph) < 30:
            continue
        scores = score_paragraph(paragraph)
        if scores[SectionKey.SUMMARY.value] >= 1 or max(scores.values()) <= 1.0:
            state.set_section(SectionKey.SUMMARY.value, paragraph, "heuristic")
            return


def _merge_boundaries(*boundary_lists: list[SectionBoundary]) -> list[SectionBoundary]:
    """Prefer earlier layers; at the same line, keep the first registered match."""
    by_index: dict[int, SectionBoundary] = {}
    for boundaries in boundary_lists:
        for boundary in boundaries:
            if boundary.line_index not in by_index:
                by_index[boundary.line_index] = boundary
    return sorted(by_index.values(), key=lambda b: b.line_index)


def _dedupe_same_key(boundaries: list[SectionBoundary]) -> list[SectionBoundary]:
    """Drop repeated headers for the same section (keep the first occurrence)."""
    seen_keys: set[str] = set()
    result: list[SectionBoundary] = []
    for boundary in boundaries:
        if boundary.key in seen_keys:
            continue
        seen_keys.add(boundary.key)
        result.append(boundary)
    return result


def _contact_lines(lines: list[str], boundaries: list[SectionBoundary]) -> list[str]:
    if not lines:
        return []
    if boundaries:
        end = max(boundaries[0].line_index, 0)
        return [line.strip() for line in lines[:end] if line.strip()]
    return [line.strip() for line in lines[:8] if line.strip()]


def _slice_sections(
    lines: list[str],
    boundaries: list[SectionBoundary],
) -> tuple[dict[str, str], list[tuple[int, int]]]:
    sections: dict[str, str] = {}
    methods: dict[str, str] = {}
    ranges: list[tuple[int, int]] = []

    for idx, boundary in enumerate(boundaries):
        start = boundary.line_index + 1
        end = boundaries[idx + 1].line_index if idx + 1 < len(boundaries) else len(lines)
        ranges.append((start, end))
        body = clean_section_body(lines[start:end])
        if body:
            sections[boundary.key] = body
            methods[boundary.key] = boundary.method

    return sections, ranges


def extract_resume_sections(text: str) -> dict:
    """
    Convert raw resume text into structured JSON with canonical sections.

    Layers (in order):
      1. Exact synonym match on header lines
      2. Regex/header pattern match on remaining candidate lines
      3. Heuristic paragraph classification for unclaimed text
    """
    if not text or not text.strip():
        from extractors.structured.build import build_structured_resume

        return build_structured_resume({}, contact_lines=[])

    lines = split_lines(text)
    state = ExtractionState()

    exact = find_exact_boundaries(lines)
    exact_indices = {b.line_index for b in exact}
    regex = find_regex_boundaries(lines, skip_line_indices=exact_indices)

    boundaries = _dedupe_same_key(_merge_boundaries(exact, regex))

    if boundaries:
        sliced, ranges = _slice_sections(lines, boundaries)
        for key, content in sliced.items():
            method = next(b.method for b in boundaries if b.key == key)
            state.set_section(key, content, method)
        infer_preamble_summary(state, lines, boundaries[0].line_index)
        claimed: list[tuple[int, int]] = [(0, boundaries[0].line_index)]
        for boundary, (start, end) in zip(boundaries, ranges):
            claimed.append((boundary.line_index, end))
        apply_heuristic_fill(state, full_text=text, assigned_line_ranges=claimed)
    else:
        apply_heuristic_fill(state, full_text=text, assigned_line_ranges=[])
        _infer_summary_from_lead(state, text)

    return state.to_json(contact_lines=_contact_lines(lines, boundaries))
