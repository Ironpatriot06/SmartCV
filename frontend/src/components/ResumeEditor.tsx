"use client";

import type { ResumeData } from "@/lib/types";
import { SummarySection } from "@/components/sections/SummarySection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";

type ResumeEditorProps = {
  resume: ResumeData;
  onChange: (resume: ResumeData) => void;
  readOnly?: boolean;
};

export function ResumeEditor({
  resume,
  onChange,
  readOnly = false,
}: ResumeEditorProps) {
  const patch = (partial: Partial<ResumeData>) => {
    if (readOnly) return;
    onChange({ ...resume, ...partial });
  };

  return (
    <fieldset
      disabled={readOnly}
      className={`grid gap-4 border-0 p-0 m-0 min-w-0 ${readOnly ? "opacity-60" : ""}`}
    >
      <SummarySection
        summary={resume.summary}
        onChange={(summary) => patch({ summary })}
      />
      <ExperienceSection
        items={resume.experience}
        onChange={(experience) => patch({ experience })}
      />
      <EducationSection
        items={resume.education}
        onChange={(education) => patch({ education })}
      />
      <ProjectsSection
        items={resume.projects}
        onChange={(projects) => patch({ projects })}
      />
      <SkillsSection
        skills={resume.skills}
        onChange={(skills) => patch({ skills })}
      />
    </fieldset>
  );
}
