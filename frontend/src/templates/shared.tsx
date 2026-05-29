import type { CSSProperties, ReactNode } from "react";

export function formatDateRange(
  startDate?: string,
  endDate?: string,
): string | null {
  const start = startDate?.trim();
  const end = endDate?.trim();
  if (start && end) return `${start} – ${end}`;
  return start || end || null;
}

export function joinMeta(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(" · ");
}

type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  headingClassName?: string;
  headingStyle?: CSSProperties;
};

export function ResumeSection({
  title,
  children,
  className = "",
  headingClassName = "",
  headingStyle,
}: SectionProps) {
  return (
    <section className={`resume-section mb-3.5 last:mb-0 ${className}`}>
      <h2
        className={`print-avoid-break ${headingClassName}`.trim()}
        style={headingStyle}
      >
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function BulletList({
  items,
  className = "",
  style,
}: {
  items: string[];
  className?: string;
  style?: CSSProperties;
}) {
  if (!items.length) return null;
  return (
    <ul className={`resume-bullet-list list-disc pl-[14pt] space-y-0.5 ${className}`} style={style}>
      {items.map((item, index) => (
        <li
          key={`${index}-${item.slice(0, 24)}`}
          // Allow lists to flow across pages, but keep each bullet intact.
          className="resume-bullet print-avoid-break"
          style={{
            overflowWrap: "break-word",
            wordBreak: "break-word",
            listStylePosition: "outside",
            paddingLeft: "1pt",
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function hasContent(data: {
  summary: string;
  education: unknown[];
  experience: unknown[];
  projects: unknown[];
  skills: string[];
}): boolean {
  return (
    Boolean(data.summary.trim()) ||
    data.education.length > 0 ||
    data.experience.length > 0 ||
    data.projects.length > 0 ||
    data.skills.length > 0
  );
}
