"use client";

import type { ExportTemplateId } from "@/lib/export/types";
import type { ResumeData } from "@/lib/types";
import { AtsTemplate, ModernTemplate, NewTemplate, PRINT_ROOT_ID } from "@/templates";

type ResumePrintAreaProps = {
  data: ResumeData;
  templateId: ExportTemplateId;
};

/**
 * Off-screen presentation-only render target for PDF export.
 * Not the editable form UI — dedicated printable templates only.
 */
export function ResumePrintArea({ data, templateId }: ResumePrintAreaProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-[-10000px] top-0 z-[-1] overflow-visible"
    >
      <div
        id={PRINT_ROOT_ID}
        className="bg-white print-resume-root"
        // Match the printable A4 content box (210mm - 2x10mm margins = 190mm).
        style={{
          width: "195mm",
          maxWidth: "200mm",
          minHeight: "277mm",
          padding: "0",
          boxSizing: "border-box",
          overflow: "visible",
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {templateId === "ats" ? (
          <AtsTemplate data={data} />
        ) : templateId === "modern" ? (
          <ModernTemplate data={data} />
        ) : (
          <NewTemplate data={data} />
        )}
      </div>
    </div>
  );
}
