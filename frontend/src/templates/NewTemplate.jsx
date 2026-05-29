import { PRINT_PAGE_CLASS } from "./types";
import { BulletList, formatDateRange } from "./shared";

function cleanLink(link) {
  return link.replace(/^https?:\/\//, "").replace(/^www\./, "").trim();
}

const SectionDivider = () => (
  <div
   style={{
     marginTop: "5px",
     marginBottom: "8px",
     height: "1px",
     width: "100%",
     backgroundColor: "#64748b",
   }}
  />
);

export function NewTemplate({ data }) {
  const headingStyle =
   "text-[11pt] font-bold uppercase tracking-wide";

  return (
   <article
     className={`${PRINT_PAGE_CLASS} font-sans`}
     style={{
       width: "100%",
       maxWidth: "100%",
       fontSize: "10pt",
       lineHeight: 1.35,
       padding: "0",
       color: "#111827",
     }}
   >
{/* HEADER */}

    <header className="mb-4">
    <h1
      className="font-bold"
      style={{
        fontSize: "28pt",
        lineHeight: 1.05,
      }}
    >
      {data.contact.name}
    </h1>

    <div
  className="mt-4 text-[9pt]"
  style={{
    lineHeight: 2,
    wordBreak: "break-word",
  }}
>
          {data.contact.phone && <span>{data.contact.phone}</span>}

          {data.contact.email && (
            <>
              <span>|</span>
              <span>{data.contact.email}</span>
            </>
          )}

          {(data.contact.links ?? [])
            .filter(
              (link) =>
                !link.includes("gmail.com") &&
                link !== "https://github.io",
            )
            .map((link) => (
              <span key={link} className="flex items-center gap-x-2">
                <span>|</span>
                <span>{cleanLink(link)}</span>
              </span>
            ))}
        </div>

        <div
          className="mt-4 h-[1px]"
          style={{ backgroundColor: "#64748b" }}
        />
      </header>

  {/* SUMMARY */}

  {data.summary.trim() && (
    <>
      <h2 className={headingStyle}>SUMMARY</h2>
      <SectionDivider />

      <p className="text-[10.5pt] leading-relaxed">
        {data.summary}
      </p>
    </>
  )}

  {/* EXPERIENCE */}

  {data.experience.length > 0 && (
    <div className="mt-4">
      <h2 className={headingStyle}>EXPERIENCE</h2>
      <SectionDivider />

      <div className="space-y-4">
        {data.experience.map((item) => {
          const dates = formatDateRange(
            item.startDate,
            item.endDate
          );

          return (
            <div
              key={item.id}
              className="print-avoid-break"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <div className="font-bold text-[10.75pt]">
                    {item.title}
                    {item.company &&
                      ` — ${item.company}`}
                  </div>

                  {item.location && (
                    <div className="italic text-[9.25pt]">
                      {item.location}
                    </div>
                  )}
                </div>

                {dates && (
                  <div className="font-medium text-[9.25pt] whitespace-nowrap">
                    {dates}
                  </div>
                )}
              </div>

              <BulletList
                items={item.bullets}
                className="mt-1 text-[10pt]"
              />
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* EDUCATION */}

  {data.education.length > 0 && (
    <div className="mt-5">
      <h2 className={headingStyle}>EDUCATION</h2>
      <SectionDivider />

      <div className="space-y-1">
        {data.education.map((item) => {
          const dates = formatDateRange(
            item.startDate,
            item.endDate
          );

          return (
            <div
              key={item.id}
              className="print-avoid-break"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <div className="font-bold">
                    {item.institution}
                  </div>

                  <div>
                    {item.degree}
                    {item.field
                      ? ` in ${item.field}`
                      : ""}
                  </div>

                  {item.location && (
                    <div>{item.location}</div>
                  )}
                </div>

                {dates && (
                  <div className="font-medium whitespace-nowrap">
                    {dates}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* PROJECTS */}

  {data.projects.length > 0 && (
    <div className="mt-9">
      <h2 className={headingStyle} mt-2>PROJECTS</h2>
      <SectionDivider />

      <div className="space-y-5">
        {data.projects.map((item) => (
          <div
            key={item.id}
            className="print-avoid-break"
          >
            <div className="font-bold">
              {item.name}

              {item.github && (
                <span className="font-normal">
                  {" | GitHub"}
                </span>
              )}
            </div>

            {item.technologies.length > 0 && (
              <div className="text-[9.75pt]">
                <strong>
                  Technologies:
                </strong>{" "}
                {item.technologies.join(", ")}
              </div>
            )}

            {item.description && (
              <div className="text-[9.75pt]">
                {item.description}
              </div>
            )}

            <BulletList
              items={item.bullets}
              className="mt-1 text-[10pt]"
            />
          </div>
        ))}
      </div>
    </div>
  )}

  {/* SKILLS */}

  {data.skills.length > 0 && (
    <div className="mt-4">
      <h2 className={headingStyle}>SKILLS</h2>
      <SectionDivider />

      <p
        className="text-[10pt]"
        style={{
          lineHeight: 1.5,
        }}
      >
        <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 10px",
    lineHeight: 1.5,
  }}
>
  {data.skills.map((skill) => (
    <span key={skill}>{skill}</span>
  ))}
</div>
      </p>
    </div>
  )}
    </article>
  );
}