import type { ResumeData } from "./resume";

/** Raw payload from FastAPI upload — section bodies can be raw text or structured. */

export type ApiExperienceEntry = {
  company?: string | null;
  role?: string | null;
  title?: string | null;
  location?: string | null;
  duration?: string | null;
  bullets?: string[] | null;
};

export type ApiEducationEntry = {
  institution?: string | null;
  degree?: string | null;
  field?: string | null;
  location?: string | null;
  dates?: string | null;
  gpa?: string | null;
  highlights?: string[] | null;
};

export type ApiProjectEntry = {
  name?: string | null;
  technologies?: string[] | null;
  bullets?: string[] | null;
  links?: string[] | null;
  description?: string | null;
  url?: string | null;
  github?: string | null;
};

export type ApiSkills = {
  categories?: { name?: string | null; items?: string[] | null }[] | null;
  items?: string[] | null;
};

export type ApiResumeSections = {
  summary?: string | null;
  education?: string | ApiEducationEntry[] | null;
  experience?: string | ApiExperienceEntry[] | null;
  skills?: string | ApiSkills | null;
  projects?: string | ApiProjectEntry[] | null;
  _meta?: unknown;
};

export type UploadResponse = {
  filename: string;
  text: string;
  sections: ApiResumeSections;
};

export type TailorRequest = {
  resume: ResumeData;
  jobDescription: string;
};

export type TailorResponse = {
  tailoredResume: ResumeData;
};
