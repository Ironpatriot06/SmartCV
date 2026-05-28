import type { ResumeTemplateProps } from "./types";
import { PRINT_PAGE_CLASS } from "./types";
import {
  BulletList,
  formatDateRange,
  joinMeta,
  ResumeSection,
} from "./shared";

/**
 * ATS-friendly template: single column, minimal styling, high readability.
 * Avoids tables, columns, and decorative elements that confuse parsers.
 */
export function AtsTemplate({ data }: ResumeTemplateProps) {
  return (
    <article
      className={`${PRINT_PAGE_CLASS} font-serif leading-snug`}
      style={{
        width: "100%",
        fontSize: "11pt",
        lineHeight: 1.35,
        padding: "0",
        overflow: "visible",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
      }}
    >
      {data.summary.trim() && (
        <ResumeSection
          title="PROFESSIONAL SUMMARY"
          headingClassName="text-[11pt] font-bold uppercase tracking-wide border-b border-black pb-1 leading-none"
        >
          <p className="text-[11pt] text-black">{data.summary.trim()}</p>
        </ResumeSection>
      )}

      {data.experience.length > 0 && (
        <ResumeSection
          title="EXPERIENCE"
          headingClassName="text-[11pt] font-bold uppercase tracking-wide border-b border-black pb-1 leading-none"
        >
          <div className="space-y-4">
            {data.experience.map((item) => {
              const dates = formatDateRange(item.startDate, item.endDate);
              return (
                <div key={item.id} className="print-avoid-break">
                  <div className="flex justify-between gap-3">
                    <p className="font-bold text-[11pt] pr-2">
                      {item.title}
                      {item.company ? ` — ${item.company}` : ""}
                    </p>
                    {dates && (
                      <p className="shrink-0 text-[10pt] whitespace-nowrap text-right">
                        {dates}
                      </p>
                    )}
                  </div>
                  {joinMeta([item.location]) && (
                    <p className="text-[10pt] italic">
                      {joinMeta([item.location])}
                    </p>
                  )}
                  <BulletList items={item.bullets} className="mt-1 text-[10.5pt]" />
                </div>
              );
            })}
          </div>
        </ResumeSection>
      )}

      {data.education.length > 0 && (
        <ResumeSection
          title="EDUCATION"
          headingClassName="text-[11pt] font-bold uppercase tracking-wide border-b border-black pb-1 leading-none"
        >
          <div className="space-y-3">
            {data.education.map((item) => {
              const dates = formatDateRange(item.startDate, item.endDate);
              const degreeLine = joinMeta([
                item.degree,
                item.field,
                item.gpa ? `GPA: ${item.gpa}` : null,
              ]);
              return (
                <div key={item.id} className="print-avoid-break">
                  <div className="flex justify-between gap-4">
                    <p className="font-bold text-[11pt]">{item.institution}</p>
                    {dates && (
                      <p className="shrink-0 text-[10pt] whitespace-nowrap">
                        {dates}
                      </p>
                    )}
                  </div>
                  {degreeLine && <p className="text-[10.5pt]">{degreeLine}</p>}
                  {item.location && (
                    <p className="text-[10pt] italic">{item.location}</p>
                  )}
                  <BulletList items={item.highlights} className="text-[10.5pt]" />
                </div>
              );
            })}
          </div>
        </ResumeSection>
      )}

      {data.projects.length > 0 && (
        <ResumeSection
          title="PROJECTS"
          headingClassName="text-[11pt] font-bold uppercase tracking-wide border-b border-black pb-1 leading-none"
        >
          <div className="space-y-3">
            {data.projects.map((item) => (
              <div key={item.id} className="print-avoid-break">
                <p className="font-bold text-[11pt]">{item.name}</p>
                {item.technologies.length > 0 && (
                  <p className="text-[10pt]">
                    {item.technologies.join(", ")}
                  </p>
                )}
                {item.description.trim() && (
                  <p className="mt-0.5 text-[10.5pt]">{item.description.trim()}</p>
                )}
                <BulletList items={item.bullets} className="text-[10.5pt]" />
              </div>
            ))}
          </div>
        </ResumeSection>
      )}

      {data.skills.length > 0 && (
        <ResumeSection
          title="SKILLS"
          headingClassName="text-[11pt] font-bold uppercase tracking-wide border-b border-black pb-1 leading-none"
        >
          <p className="text-[10.5pt]">{data.skills.join(" · ")}</p>
        </ResumeSection>
      )}
    </article>
  );
}
