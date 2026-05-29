import type { ResumeData } from "@/lib/types";

/**
 * Merge tailored output with the original resume so factual metadata cannot drift.
 * Education is copied verbatim — the backend does not tailor it.
 */
export function mergeTailoredWithOriginal(
  original: ResumeData,
  tailored: ResumeData,
): ResumeData {
  const experienceById = new Map(original.experience.map((e) => [e.id, e]));
  const projectsById = new Map(original.projects.map((p) => [p.id, p]));

  const originalSkillKeys = new Set(
    original.skills.map((s) => s.trim().toLowerCase()),
  );

  const skills = tailored.skills.filter((skill) =>
    originalSkillKeys.has(skill.trim().toLowerCase()),
  );
  const mergedSkills = [
    ...skills,
    ...original.skills.filter(
      (s) => !skills.some((t) => t.toLowerCase() === s.toLowerCase()),
    ),
  ];

  return {
    contact: original.contact,
    summary: tailored.summary.trim() || original.summary,
    education: original.education,
    experience: tailored.experience.map((item) => {
      const source = experienceById.get(item.id);
      if (!source) return item;
      return {
        ...source,
        bullets: item.bullets.length ? item.bullets : source.bullets,
      };
    }),
    projects: tailored.projects.map((item) => {
      const source = projectsById.get(item.id);
      if (!source) return item;
      return {
        ...source,
        description: item.description.trim() || source.description,
        bullets: item.bullets.length ? item.bullets : source.bullets,
      };
    }),
    skills: mergedSkills.length ? mergedSkills : original.skills,
  };
}
