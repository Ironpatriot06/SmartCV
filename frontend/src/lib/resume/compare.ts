import type { ResumeData, ResumeDiff } from "@/lib/types";

export function compareResumeVersions(
  oldResume: ResumeData,
  newResume: ResumeData,
): ResumeDiff[] {
  const diffs: ResumeDiff[] = [];

  addSectionDiff(
    diffs,
    "Summary",
    normalizeLines([oldResume.summary]),
    normalizeLines([newResume.summary]),
  );
  addSectionDiff(
    diffs,
    "Experience",
    normalizeLines(experienceLines(oldResume)),
    normalizeLines(experienceLines(newResume)),
  );
  addSectionDiff(
    diffs,
    "Projects",
    normalizeLines(projectLines(oldResume)),
    normalizeLines(projectLines(newResume)),
  );
  addSectionDiff(
    diffs,
    "Education",
    normalizeLines(educationLines(oldResume)),
    normalizeLines(educationLines(newResume)),
  );
  addSectionDiff(
    diffs,
    "Skills",
    normalizeLines(oldResume.skills),
    normalizeLines(newResume.skills),
  );

  return diffs;
}

function addSectionDiff(
  diffs: ResumeDiff[],
  section: string,
  beforeLines: string[],
  afterLines: string[],
) {
  const max = Math.max(beforeLines.length, afterLines.length);
  for (let index = 0; index < max; index += 1) {
    const before = beforeLines[index] ?? "";
    const after = afterLines[index] ?? "";
    if (!before && !after) continue;
    if (before === after) continue;
    diffs.push({ section, before, after });
  }
}

function experienceLines(resume: ResumeData) {
  return resume.experience.flatMap((item) => {
    const header = [item.title, item.company].filter(Boolean).join(" · ");
    return item.bullets.map((bullet) =>
      header ? `${header} — ${bullet}` : bullet,
    );
  });
}

function projectLines(resume: ResumeData) {
  return resume.projects.flatMap((item) => {
    const header = item.name ? `${item.name} — ` : "";
    const description = item.description ? `${header}${item.description}` : "";
    const bullets = item.bullets.map((bullet) => `${header}${bullet}`);
    return description ? [description, ...bullets] : bullets;
  });
}

function educationLines(resume: ResumeData) {
  return resume.education.flatMap((item) => {
    const degree = [item.degree, item.field].filter(Boolean).join(" ");
    const header = [item.institution, degree].filter(Boolean).join(" — ");
    if (!header) return item.highlights;
    if (!item.highlights.length) return [header];
    return item.highlights.map((highlight) => `${header} — ${highlight}`);
  });
}

function normalizeLines(lines: string[]) {
  return lines.map((line) => line.trim()).filter(Boolean);
}
