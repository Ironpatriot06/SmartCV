/** Core resume entities — stable shape for tailoring, ATS, export, and versioning. */

export type EducationItem = {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  highlights: string[];
};

export type ExperienceItem = {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
};

export type ProjectItem = {
  id: string;
  name: string;
  url?: string;
  technologies: string[];
  description: string;
  bullets: string[];
  github?: string;
};

export type ContactInfo = {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  links: string[];
};

export type ResumeData = {
  contact: ContactInfo;
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: string[];
};

/** Versioned document wrapper for export / diff / persistence. */
export type ResumeDocument = {
  id: string;
  version: number;
  updatedAt: string;
  sourceFilename?: string;
  data: ResumeData;
};

export type ResumeVersion = {
  id: string;
  createdAt: string;
  label: string;
  atsScore?: number;
  resume: ResumeData;
};

export type ResumeHistory = {
  currentVersionId: string;
  versions: ResumeVersion[];
};

export type ResumeDiff = {
  section: string;
  before: string;
  after: string;
};
