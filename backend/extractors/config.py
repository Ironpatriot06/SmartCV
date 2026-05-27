"""Canonical section keys and synonym/pattern registries."""

from enum import Enum


class SectionKey(str, Enum):
    SUMMARY = "summary"
    EDUCATION = "education"
    EXPERIENCE = "experience"
    SKILLS = "skills"
    PROJECTS = "projects"


CANONICAL_KEYS = tuple(s.value for s in SectionKey)

# Normalized header text -> canonical key (exact layer).
SECTION_SYNONYMS: dict[str, str] = {
    # summary
    "summary": SectionKey.SUMMARY.value,
    "professional summary": SectionKey.SUMMARY.value,
    "career summary": SectionKey.SUMMARY.value,
    "profile": SectionKey.SUMMARY.value,
    "professional profile": SectionKey.SUMMARY.value,
    "objective": SectionKey.SUMMARY.value,
    "career objective": SectionKey.SUMMARY.value,
    "about": SectionKey.SUMMARY.value,
    "about me": SectionKey.SUMMARY.value,
    "overview": SectionKey.SUMMARY.value,
    # education
    "education": SectionKey.EDUCATION.value,
    "academic background": SectionKey.EDUCATION.value,
    "academic history": SectionKey.EDUCATION.value,
    "educational background": SectionKey.EDUCATION.value,
    "qualifications": SectionKey.EDUCATION.value,
    "academics": SectionKey.EDUCATION.value,
    # experience
    "experience": SectionKey.EXPERIENCE.value,
    "work experience": SectionKey.EXPERIENCE.value,
    "professional experience": SectionKey.EXPERIENCE.value,
    "employment history": SectionKey.EXPERIENCE.value,
    "employment": SectionKey.EXPERIENCE.value,
    "career history": SectionKey.EXPERIENCE.value,
    "relevant experience": SectionKey.EXPERIENCE.value,
    "work history": SectionKey.EXPERIENCE.value,
    # skills
    "skills": SectionKey.SKILLS.value,
    "technical skills": SectionKey.SKILLS.value,
    "core skills": SectionKey.SKILLS.value,
    "key skills": SectionKey.SKILLS.value,
    "core competencies": SectionKey.SKILLS.value,
    "competencies": SectionKey.SKILLS.value,
    "areas of expertise": SectionKey.SKILLS.value,
    "expertise": SectionKey.SKILLS.value,
    "technologies": SectionKey.SKILLS.value,
    "tools": SectionKey.SKILLS.value,
    "technical proficiencies": SectionKey.SKILLS.value,
    # projects
    "projects": SectionKey.PROJECTS.value,
    "personal projects": SectionKey.PROJECTS.value,
    "selected projects": SectionKey.PROJECTS.value,
    "project experience": SectionKey.PROJECTS.value,
    "academic projects": SectionKey.PROJECTS.value,
    "portfolio": SectionKey.PROJECTS.value,
}

# Regex layer: patterns tested against normalized headers (regex layer).
SECTION_HEADER_PATTERNS: dict[str, list[str]] = {
    SectionKey.SUMMARY.value: [
        r"^(professional\s+)?(summary|profile|objective|overview)\b",
        r"^about(\s+me)?\b",
    ],
    SectionKey.EDUCATION.value: [
        r"^education(al(\s+background|\s+history))?(\s*&\s*training)?\b",
        r"^academic(\s+(background|history|credentials))?\b",
        r"^qualifications\b",
    ],
    SectionKey.EXPERIENCE.value: [
        r"^(professional\s+|relevant\s+|work\s+)?experience\b",
        r"^employment(\s+history)?\b",
        r"^career(\s+history)?\b",
        r"^work\s+history\b",
    ],
    SectionKey.SKILLS.value: [
        r"^(technical\s+|key\s+|core\s+)?skills(\s*(&|and)\s*tools)?\b",
        r"^core\s+competen(cies|ce)\b",
        r"^areas?\s+of\s+expertise\b",
        r"^technical\s+(proficiencies|expertise)\b",
        r"^tools\s+(&|and)\s+technologies\b",
    ],
    SectionKey.PROJECTS.value: [
        r"^(personal\s+|selected\s+|academic\s+)?projects\b",
        r"^project\s+experience\b",
        r"^portfolio\b",
    ],
}

# Heuristic keyword hints (lowercase substrings).
SECTION_KEYWORDS: dict[str, tuple[str, ...]] = {
    SectionKey.SUMMARY.value: (
        "summary",
        "profile",
        "objective",
        "passionate",
        "seeking",
        "years of experience",
    ),
    SectionKey.EDUCATION.value: (
        "university",
        "college",
        "bachelor",
        "master",
        "b.s.",
        "b.a.",
        "m.s.",
        "ph.d",
        "degree",
        "gpa",
        "coursework",
    ),
    SectionKey.EXPERIENCE.value: (
        "inc.",
        "llc",
        "ltd",
        "responsibilities",
        "managed",
        "developed",
        "engineer at",
        "intern",
        "present",
    ),
    SectionKey.SKILLS.value: (
        "python",
        "java",
        "javascript",
        "sql",
        "aws",
        "docker",
        "kubernetes",
        "proficient",
        "familiar with",
    ),
    SectionKey.PROJECTS.value: (
        "github",
        "repository",
        "built",
        "developed a",
        "capstone",
        "hackathon",
    ),
}

DATE_RANGE_PATTERN = (
    r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?"
    r"\s+\d{4}\s*[-–—to]+\s*(?:present|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}\b"
    r"|\b\d{4}\s*[-–—]\s*(?:\d{4}|present)\b"
)
