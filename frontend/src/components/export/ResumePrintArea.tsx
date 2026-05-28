"use client";

import type { ExportTemplateId } from "@/lib/export/types";
import type { ResumeData } from "@/lib/types";
import { AtsTemplate, ModernTemplate, PRINT_ROOT_ID } from "@/templates";

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
        className="bg-white"
        // Match the printable A4 content box (210mm − 2×10mm margins = 190mm).
        // Padding adds breathing room so content doesn't hug the left edge.
        style={{
          width: "190mm",
          padding: "10mm",
          boxSizing: "border-box",
          overflow: "visible",
        }}
      >
        {templateId === "ats" ? (
          <AtsTemplate data={data} />
        ) : (
          <ModernTemplate data={data} />
        )}
      </div>
    </div>
  );
}
