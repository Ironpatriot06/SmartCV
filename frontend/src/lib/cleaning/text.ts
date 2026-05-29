import type { EducationItem, ExperienceItem, ProjectItem, ResumeData } from "@/lib/types";

const CODE_FENCE_RE = /```[\s\S]*?```/g;
const MARKDOWN_HEADING_RE = /^\s{0,3}#{1,6}\s+/gm;
const MARKDOWN_BULLET_RE = /^\s*(?:[-*+]|[0-9]+[.)])\s+/;
const QUOTE_RE = /^\s{0,3}>\s?/gm;

export function removeMarkdownArtifacts(value: string): string {
  return value
    .replace(CODE_FENCE_RE, "")
    .replace(MARKDOWN_HEADING_RE, "")
    .replace(QUOTE_RE, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`+/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

export function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function cleanBulletText(value: string): string {
  return normalizeWhitespace(removeMarkdownArtifacts(value))
    .replace(MARKDOWN_BULLET_RE, "")
    .replace(/^•\s*/, "")
    .replace(/^\s*[-–—]\s*/, "")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

export function cleanPlainText(value: string): string {
  return normalizeWhitespace(removeMarkdownArtifacts(value))
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function cleanExperienceItem(item: ExperienceItem): ExperienceItem {
  return {
    ...item,
    company: cleanPlainText(item.company),
    title: cleanPlainText(item.title),
    location: item.location ? cleanPlainText(item.location) : item.location,
    bullets: item.bullets.map(cleanBulletText).filter(Boolean),
  };
}

function cleanEducationItem(item: EducationItem): EducationItem {
  return {
    ...item,
    institution: cleanPlainText(item.institution),
    degree: cleanPlainText(item.degree),
    field: item.field ? cleanPlainText(item.field) : item.field,
    location: item.location ? cleanPlainText(item.location) : item.location,
    gpa: item.gpa ? cleanPlainText(item.gpa) : item.gpa,
    highlights: item.highlights.map(cleanBulletText).filter(Boolean),
  };
}

function cleanProjectItem(item: ProjectItem): ProjectItem {
  return {
    ...item,
    name: cleanPlainText(item.name),
    description: cleanPlainText(item.description),
    technologies: item.technologies.map(cleanPlainText).filter(Boolean),
    bullets: item.bullets.map(cleanBulletText).filter(Boolean),
  };
}

export function cleanResumeData(data: ResumeData): ResumeData {
  return {
    ...data,
    contact: {
      ...data.contact,
      name: cleanPlainText(data.contact.name),
      email: data.contact.email ? cleanPlainText(data.contact.email) : data.contact.email,
      phone: data.contact.phone ? cleanPlainText(data.contact.phone) : data.contact.phone,
      location: data.contact.location ? cleanPlainText(data.contact.location) : data.contact.location,
      links: data.contact.links.map(cleanPlainText).filter(Boolean),
    },
    summary: cleanPlainText(data.summary),
    education: data.education.map(cleanEducationItem),
    experience: data.experience.map(cleanExperienceItem),
    projects: data.projects.map(cleanProjectItem),
    skills: data.skills.map(cleanPlainText).filter(Boolean),
  };
}
