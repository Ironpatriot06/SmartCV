"""Data structures for section extraction."""

from dataclasses import dataclass, field
from typing import Literal

DetectionMethod = Literal["exact", "regex", "heuristic", "preamble"]


@dataclass
class SectionBoundary:
    line_index: int
    key: str
    method: DetectionMethod
    raw_header: str = ""


@dataclass
class ExtractionState:
    sections: dict[str, str] = field(default_factory=dict)
    methods: dict[str, DetectionMethod] = field(default_factory=dict)
    boundaries: list[SectionBoundary] = field(default_factory=list)

    def set_section(self, key: str, content: str, method: DetectionMethod) -> None:
        content = content.strip()
        if not content:
            return
        if key in self.sections and len(content) <= len(self.sections[key]):
            return
        self.sections[key] = content
        self.methods[key] = method

    def to_json(self, *, contact_lines: list[str] | None = None) -> dict:
        from extractors.structured.build import build_structured_resume

        meta = {"detection": dict(self.methods)} if self.methods else None
        return build_structured_resume(
            self.sections,
            meta=meta,
            contact_lines=contact_lines,
        )
