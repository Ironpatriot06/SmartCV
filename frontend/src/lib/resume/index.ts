export {
  EMPTY_RESUME_DATA,
  createEducationItem,
  createExperienceItem,
  createProjectItem,
  createResumeDocument,
  nextResumeVersion,
} from "./defaults";

export { resumeDataFromApi } from "./map-api";

export { mergeTailoredWithOriginal } from "./validate-tailored";

export {
  RESUME_HISTORY_STORAGE_KEY,
  buildTailorLabel,
  createResumeHistory,
  createResumeVersion,
  extractRoleFromJobDescription,
  getResumeVersion,
  normalizeResumeHistory,
} from "./history";

export { compareResumeVersions } from "./compare";

export {
  parseEducationText,
  parseExperienceText,
  parseProjectsText,
  parseSkillsText,
} from "./parse";
