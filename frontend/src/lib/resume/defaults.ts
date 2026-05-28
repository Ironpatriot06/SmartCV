import { createId } from "@/lib/ids";
import type {
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeData,
  ResumeDocument,
} from "@/lib/types";

export const EMPTY_RESUME_DATA: ResumeData = {
  contact: {
    name: "",
    email: "",
    phone: "",
    location: "",
    links: [],
  },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
};

export function createEducationItem(
  partial: Partial<Omit<EducationItem, "id">> = {},
): EducationItem {
  return {
    id: createId(),
    institution: "",
    degree: "",
    highlights: [],
    ...partial,
  };
}

export function createExperienceItem(
  partial: Partial<Omit<ExperienceItem, "id">> = {},
): ExperienceItem {
  return {
    id: createId(),
    company: "",
    title: "",
    bullets: [],
    ...partial,
  };
}

export function createProjectItem(
  partial: Partial<Omit<ProjectItem, "id">> = {},
): ProjectItem {
  return {
    id: createId(),
    name: "",
    technologies: [],
    description: "",
    bullets: [],
    ...partial,
  };
}

export function createResumeDocument(
  data: ResumeData = EMPTY_RESUME_DATA,
  sourceFilename?: string,
): ResumeDocument {
  return {
    id: createId(),
    version: 1,
    updatedAt: new Date().toISOString(),
    sourceFilename,
    data,
  };
}

export function nextResumeVersion(
  document: ResumeDocument,
  data: ResumeData,
): ResumeDocument {
  return {
    ...document,
    version: document.version + 1,
    updatedAt: new Date().toISOString(),
    data,
  };
}
