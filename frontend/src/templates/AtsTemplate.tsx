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
        maxWidth: "100%",
        fontSize: "11pt",
        lineHeight: 1.32,
        padding: "0",
        overflow: "visible",
        overflowWrap: "break-word",
        wordBreak: "break-word",
      }}
    >
      <div className="mb-4 text-center">
  <h1 className="text-[22pt] font-bold">
    {data.contact.name}
  </h1>

  <p className="text-[10pt]">
    {data.contact.phone}
    {" | "}
    {data.contact.email}
    {" | "}
    {data.contact.links?.join(" | ")}
  </p>
</div>
      {data.summary.trim() && (
        <ResumeSection
          title="PROFESSIONAL SUMMARY"
          headingClassName="text-[11pt] font-bold uppercase tracking-wide border-b border-black pb-1 leading-none"
        >
          <p className="text-[10.75pt] text-black">{data.summary.trim()}</p>
        </ResumeSection>
      )}

      {data.experience.length > 0 && (
        <ResumeSection
          title="EXPERIENCE"
          headingClassName="text-[11pt] font-bold uppercase tracking-wide border-b border-black pb-1 leading-none"
        >
          <div className="space-y-3">
            {data.experience.map((item) => {
              const dates = formatDateRange(item.startDate, item.endDate);
              return (
                <div key={item.id} className="resume-item print-avoid-break">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                    <p className="min-w-0 pr-2 text-[10.75pt] font-bold">
                      {item.title}
                      {item.company ? ` — ${item.company}` : ""}
                    </p>
                    {dates && (
                      <p className="max-w-[34mm] shrink-0 text-right text-[9.5pt] leading-snug">
                        {dates}
                      </p>
                    )}
                  </div>
                  {joinMeta([item.location]) && (
                    <p className="text-[10pt] italic">
                      {joinMeta([item.location])}
                    </p>
                  )}
                  <BulletList items={item.bullets} className="mt-1 text-[10.25pt]" />
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
          <div className="space-y-2.5">
            {data.education.map((item) => {
              const dates = formatDateRange(item.startDate, item.endDate);
              const degreeLine = joinMeta([
                item.degree,
                item.field,
                item.gpa ? `GPA: ${item.gpa}` : null,
              ]);
              return (
                <div key={item.id} className="resume-item print-avoid-break">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                    <p className="min-w-0 text-[10.75pt] font-bold">{item.institution}</p>
                    {dates && (
                      <p className="max-w-[34mm] shrink-0 text-right text-[9.5pt] leading-snug">
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
          <div className="space-y-2.5">
            {data.projects.map((item) => (
              <div key={item.id} className="resume-item print-avoid-break">
                <p className="text-[10.75pt] font-bold">{item.name}</p>
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
