"""Pydantic models mirroring the frontend ResumeData contract."""

from datetime import datetime

from pydantic import BaseModel, Field


class EducationItem(BaseModel):
    id: str
    institution: str
    degree: str
    field: str | None = None
    location: str | None = None
    startDate: str | None = None
    endDate: str | None = None
    gpa: str | None = None
    highlights: list[str] = Field(default_factory=list)


class ExperienceItem(BaseModel):
    id: str
    company: str
    title: str
    location: str | None = None
    startDate: str | None = None
    endDate: str | None = None
    bullets: list[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    id: str
    name: str
    url: str | None = None
    technologies: list[str] = Field(default_factory=list)
    description: str = ""
    bullets: list[str] = Field(default_factory=list)
    github: str | None = None


class ContactInfo(BaseModel):
    name: str = ""
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    links: list[str] = Field(default_factory=list)


class ResumeData(BaseModel):
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: str = ""
    education: list[EducationItem] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)


class ResumeCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    resume_data: ResumeData


class ResumeCreateResponse(BaseModel):
    id: str


class ResumeSummary(BaseModel):
    id: str
    name: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ResumeRecord(BaseModel):
    id: str
    name: str
    resume_data: ResumeData
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ResumeDeleteResponse(BaseModel):
    deleted: bool


class TailorRequest(BaseModel):
    resume: ResumeData
    jobDescription: str = Field(min_length=1)


class TailorResponse(BaseModel):
    tailoredResume: ResumeData


class KeywordMatch(BaseModel):
    keyword: str
    category: str
    count: int = 0


class ScoreComponent(BaseModel):
    id: str
    label: str
    score: int
    weight: int
    rationale: str


class AtsScoreRequest(BaseModel):
    resume: ResumeData
    jobDescription: str = Field(min_length=1)


class AtsScoreResponse(BaseModel):
    score: int
    jdMatchPercentage: int
    healthLabel: str
    matchedKeywords: list[KeywordMatch] = Field(default_factory=list)
    missingKeywords: list[KeywordMatch] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    scoreBreakdown: list[ScoreComponent] = Field(default_factory=list)
    metrics: dict[str, int | float | str] = Field(default_factory=dict)
