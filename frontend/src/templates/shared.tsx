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
    <section className={`mb-4 last:mb-0 ${className}`}>
      <h2
        className={`print-avoid-break ${headingClassName}`.trim()}
        style={headingStyle}
      >
        {title}
      </h2>
      <div className="mt-5">{children}</div>
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
    <ul className={`list-disc pl-4 space-y-1 ${className}`} style={style}>
      {items.map((item, index) => (
        <li
          key={`${index}-${item.slice(0, 24)}`}
          // Allow lists to flow across pages, but keep each bullet intact.
          className="print-avoid-break"
          style={{
            overflowWrap: "anywhere",
            wordBreak: "break-word",
            listStylePosition: "outside",
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
