import type {
  ApiEducationEntry,
  ApiExperienceEntry,
  ApiProjectEntry,
  ApiResumeSections,
  ApiSkills,
  ResumeData,
} from "@/lib/types";
import {
  parseEducationText,
  parseExperienceText,
  parseProjectsText,
  parseSkillsText,
} from "./parse";
import {
  createEducationItem,
  createExperienceItem,
  createProjectItem,
} from "./defaults";

const DATE_RANGE =
  /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\b\d{4})\s*[-–—]\s*(\b(?:Present|Current|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\b\d{4}|Present|Current)/i;
const YEAR_ONLY = /\b\d{4}\b/;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function sectionText(value: unknown): string {
  return isString(value) ? value.trim() : "";
}

function parseDateRange(value: string | null | undefined): {
  startDate?: string;
  endDate?: string;
} {
  if (!value) return {};
  const match = value.match(DATE_RANGE);
  if (match) {
    return {
      startDate: match[1]?.trim(),
      endDate: match[2]?.trim(),
    };
  }
  const yearMatch = value.match(YEAR_ONLY);
  if (yearMatch) {
    return { startDate: yearMatch[0].trim() };
  }
  return {};
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (isString(item) ? item.trim() : ""))
    .filter(Boolean);
}

function mapExperienceEntries(entries: ApiExperienceEntry[]): ResumeData["experience"] {
  return entries
    .map((entry) => {
      const title = sectionText(entry.role ?? entry.title);
      const company = sectionText(entry.company);
      const location = sectionText(entry.location);
      const bullets = normalizeList(entry.bullets);
      const { startDate, endDate } = parseDateRange(entry.duration ?? null);

      if (!title && !company && bullets.length === 0) return null;

      return createExperienceItem({
        title,
        company,
        location: location || undefined,
        startDate,
        endDate,
        bullets,
      });
    })
    .filter(Boolean) as ResumeData["experience"];
}

function mapEducationEntries(entries: ApiEducationEntry[]): ResumeData["education"] {
  return entries
    .map((entry) => {
      const institution = sectionText(entry.institution);
      const degree = sectionText(entry.degree);
      const field = sectionText(entry.field);
      const location = sectionText(entry.location);
      const gpa = sectionText(entry.gpa);
      const highlights = normalizeList(entry.highlights);
      const { startDate, endDate } = parseDateRange(entry.dates ?? null);

      if (!institution && !degree && highlights.length === 0) return null;

      return createEducationItem({
        institution,
        degree,
        field: field || undefined,
        location: location || undefined,
        startDate,
        endDate,
        gpa: gpa || undefined,
        highlights,
      });
    })
    .filter(Boolean) as ResumeData["education"];
}

function mapProjectEntries(entries: ApiProjectEntry[]): ResumeData["projects"] {
  return entries
    .map((entry) => {
      const name = sectionText(entry.name);
      const description = sectionText(entry.description);
      const technologies = normalizeList(entry.technologies);
      const bullets = normalizeList(entry.bullets);
      const links = normalizeList(entry.links);

      const github =
        sectionText(entry.github) ||
        links.find((link) => /github\.com/i.test(link)) ||
        "";
      const url =
        sectionText(entry.url) ||
        links.find((link) => link !== github) ||
        github ||
        "";

      if (!name && bullets.length === 0 && !description) return null;

      return createProjectItem({
        name,
        description,
        technologies,
        bullets,
        url: url || undefined,
        github: github || undefined,
      });
    })
    .filter(Boolean) as ResumeData["projects"];
}

function normalizeSkills(value: ApiSkills): string[] {
  const items = normalizeList(value.items);
  const categoryItems =
    value.categories?.flatMap((category) => normalizeList(category?.items)) ?? [];
  return [...new Set([...items, ...categoryItems])];
}

/** Maps unstructured FastAPI section blobs into typed ResumeData. */
export function resumeDataFromApi(sections: ApiResumeSections): ResumeData {
  const contact = {

    name: sections.contact?.name ?? "",
  
    email: sections.contact?.email ?? "",
  
    phone: sections.contact?.phone ?? "",
  
    location: sections.contact?.location ?? "",
  
    links: sections.contact?.links ?? [],
  
  };
  const summary = sectionText(sections.summary);
  const educationRaw = sectionText(sections.education);
  const experienceRaw = sectionText(sections.experience);
  const projectsRaw = sectionText(sections.projects);
  const skillsRaw = sectionText(sections.skills);

  return {
    contact,
    summary,
    education: Array.isArray(sections.education)
      ? mapEducationEntries(sections.education)
      : educationRaw
        ? parseEducationText(educationRaw)
        : [],
    experience: Array.isArray(sections.experience)
      ? mapExperienceEntries(sections.experience)
      : experienceRaw
        ? parseExperienceText(experienceRaw)
        : [],
    projects: Array.isArray(sections.projects)
      ? mapProjectEntries(sections.projects)
      : projectsRaw
        ? parseProjectsText(projectsRaw)
        : [],
    skills: isString(sections.skills)
      ? skillsRaw
        ? parseSkillsText(skillsRaw)
        : []
      : sections.skills
        ? normalizeSkills(sections.skills)
        : [],
  };
}
