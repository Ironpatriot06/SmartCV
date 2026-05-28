import type { ResumeTemplateProps } from "./types";
import { PRINT_PAGE_CLASS } from "./types";
import {
  BulletList,
  formatDateRange,
  joinMeta,
  ResumeSection,
} from "./shared";

/**
 * Modern template: subtle hierarchy, sans-serif typography, portfolio polish.
 * Still single-column for reliable PDF rendering and ATS compatibility.
 */
export function ModernTemplate({ data }: ResumeTemplateProps) {
  const COLORS = {
    slate900: "#0f172a",
    slate800: "#1e293b",
    slate700: "#334155",
    slate600: "#475569",
    slate500: "#64748b",
    slate200: "#e2e8f0",
    slate50: "#f8fafc",
    indigo700: "#4338ca",
    indigo600: "#4f46e5",
    indigo200: "#c7d2fe",
  } as const;
  const sectionHeading =
    "text-[10pt] font-semibold uppercase tracking-[0.12em]";

  return (
    <article
      className={`${PRINT_PAGE_CLASS} font-sans leading-normal`}
      style={{
        width: "100%",
        fontSize: "10.25pt",
        lineHeight: 1.4,
        padding: "0",
        overflow: "visible",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        color: COLORS.slate800,
      }}
    >
      {data.summary.trim() && (
        <ResumeSection
          title="Summary"
          headingClassName={sectionHeading}
          headingStyle={{ color: COLORS.slate500 }}
        >
          <p className="text-[11pt] leading-relaxed" style={{ color: COLORS.slate700 }}>
            {data.summary.trim()}
          </p>
        </ResumeSection>
      )}

      {data.experience.length > 0 && (
        <ResumeSection
          title="Experience"
          headingClassName={sectionHeading}
          headingStyle={{ color: COLORS.slate500 }}
          className="mt-4"
        >
          <div className="space-y-3.5">
            {data.experience.map((item) => {
              const dates = formatDateRange(item.startDate, item.endDate);
              return (
                <div
                  key={item.id}
                  className="print-avoid-break border-l-2 pl-2.5"
                  style={{ borderColor: COLORS.indigo200 }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                    <p
                      className="text-[10.75pt] font-semibold pr-2"
                      style={{ color: COLORS.slate900 }}
                    >
                      {item.title}
                    </p>
                    {dates && (
                      <p
                        className="text-[9.25pt] font-medium whitespace-nowrap"
                        style={{ color: COLORS.slate500 }}
                      >
                        {dates}
                      </p>
                    )}
                  </div>
                  <p className="text-[10.25pt]" style={{ color: COLORS.indigo700 }}>
                    {item.company}
                  </p>
                  {item.location && (
                    <p className="text-[9.25pt]" style={{ color: COLORS.slate500 }}>
                      {item.location}
                    </p>
                  )}
                  <BulletList
                    items={item.bullets}
                    className="mt-1 text-[9.75pt]"
                    style={{ color: COLORS.slate700 }}
                  />
                </div>
              );
            })}
          </div>
        </ResumeSection>
      )}

      {data.education.length > 0 && (
        <ResumeSection
          title="Education"
          headingClassName={sectionHeading}
          headingStyle={{ color: COLORS.slate500 }}
          className="mt-4"
        >
          <div className="space-y-3">
            {data.education.map((item) => {
              const dates = formatDateRange(item.startDate, item.endDate);
              const degreeLine = joinMeta([item.degree, item.field]);
              return (
                <div key={item.id} className="print-avoid-break">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <p
                      className="text-[11pt] font-semibold"
                      style={{ color: COLORS.slate900 }}
                    >
                      {item.institution}
                    </p>
                    {dates && (
                      <p
                        className="text-[9.25pt] whitespace-nowrap"
                        style={{ color: COLORS.slate500 }}
                      >
                        {dates}
                      </p>
                    )}
                  </div>
                  {degreeLine && (
                    <p className="text-[9.75pt]" style={{ color: COLORS.slate700 }}>
                      {degreeLine}
                    </p>
                  )}
                  {joinMeta([item.location, item.gpa ? `GPA ${item.gpa}` : null]) && (
                    <p className="text-[9.25pt]" style={{ color: COLORS.slate500 }}>
                      {joinMeta([
                        item.location,
                        item.gpa ? `GPA ${item.gpa}` : null,
                      ])}
                    </p>
                  )}
                  <BulletList
                    items={item.highlights}
                    className="text-[9.75pt]"
                    style={{ color: COLORS.slate700 }}
                  />
                </div>
              );
            })}
          </div>
        </ResumeSection>
      )}

      {data.projects.length > 0 && (
        <ResumeSection
          title="Projects"
          headingClassName={sectionHeading}
          headingStyle={{ color: COLORS.slate500 }}
          className="mt-4"
        >
          <div className="space-y-3">
            {data.projects.map((item) => (
              <div
                key={item.id}
                className="print-avoid-break rounded-sm px-2.5 py-2"
                style={{ backgroundColor: COLORS.slate50 }}
              >
                <p
                  className="text-[11pt] font-semibold"
                  style={{ color: COLORS.slate900 }}
                >
                  {item.name}
                </p>
                {item.technologies.length > 0 && (
                  <p className="mt-0.5 text-[9.25pt]" style={{ color: COLORS.indigo600 }}>
                    {item.technologies.join(" · ")}
                  </p>
                )}
                {item.description.trim() && (
                  <p className="mt-1 text-[9.75pt]" style={{ color: COLORS.slate600 }}>
                    {item.description.trim()}
                  </p>
                )}
                <BulletList
                  items={item.bullets}
                  className="mt-1 text-[9.75pt]"
                  style={{ color: COLORS.slate700 }}
                />
              </div>
            ))}
          </div>
        </ResumeSection>
      )}

      {data.skills.length > 0 && (
        <ResumeSection
          title="Skills"
          headingClassName={sectionHeading}
          headingStyle={{ color: COLORS.slate500 }}
          className="mt-4"
        >
          <div className="flex flex-wrap gap-1">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border bg-white px-2 py-0.5 text-[9.25pt]"
                style={{
                  borderColor: COLORS.slate200,
                  color: COLORS.slate700,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </ResumeSection>
      )}
    </article>
  );
}
