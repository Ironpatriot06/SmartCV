"use client";

import type { ResumeData } from "@/lib/types";
import { BulletDiff } from "@/components/comparison/BulletDiff";
import { SectionDiff } from "@/components/comparison/SectionDiff";

type ResumeDiffProps = {
  original: ResumeData | null;
  tailored: ResumeData | null;
};

function experienceBullets(resume: ResumeData) {
  return resume.experience.flatMap((item) =>
    item.bullets.map((bullet) => `${item.title || "Experience"} · ${bullet}`),
  );
}

function projectBullets(resume: ResumeData) {
  return resume.projects.flatMap((item) =>
    [
      item.description ? `${item.name} · ${item.description}` : "",
      ...item.bullets.map((bullet) => `${item.name} · ${bullet}`),
    ].filter(Boolean),
  );
}

function addedKeywords(original: ResumeData, tailored: ResumeData) {
  const before = new Set(original.skills.map((skill) => skill.toLowerCase()));
  return tailored.skills.filter((skill) => !before.has(skill.toLowerCase()));
}

export function ResumeDiff({ original, tailored }: ResumeDiffProps) {
  if (!original || !tailored) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
        <p className="text-sm text-slate-500">
          Tailor a resume to unlock the original vs tailored comparison.
        </p>
      </div>
    );
  }

  const newKeywords = addedKeywords(original, tailored);

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-950">
            Summary changes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Yellow means rewritten, green means added, red means removed.
          </p>
        </div>
        <BulletDiff before={original.summary} after={tailored.summary} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-950">
          Added keywords
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {newKeywords.length ? (
            newKeywords.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No new skills were added to the skills section.
            </p>
          )}
        </div>
      </section>

      <SectionDiff
        title="Experience bullets"
        before={experienceBullets(original)}
        after={experienceBullets(tailored)}
      />
      <SectionDiff
        title="Project changes"
        before={projectBullets(original)}
        after={projectBullets(tailored)}
      />
    </div>
  );
}
