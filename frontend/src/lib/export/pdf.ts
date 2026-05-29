import { PRINT_ROOT_ID } from "@/templates/types";

export type ExportResumePdfOptions = {
  elementId?: string;
  filename: string;
};

const DEFAULT_MARGINS_MM: [number, number, number, number] = [10, 10, 10, 10];

/**
 * Renders the hidden print container to a downloadable A4 PDF via html2pdf.js.
 * Must run in the browser after the print template has mounted.
 */
export async function exportResumePdf({
  elementId = PRINT_ROOT_ID,
  filename,
}: ExportResumePdfOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Print template not found. Please try again.");
  }

  const html2pdf = (await import("html2pdf.js")).default;

  const safeName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  const printOverrideStyles = `
#${PRINT_ROOT_ID} {
  background-color: #ffffff !important;
  color: #0f172a !important;
  width: 190mm !important;
  max-width: 190mm !important;
  box-sizing: border-box !important;
  overflow: visible !important;
  overflow-wrap: break-word !important;
  word-break: break-word !important;
}
#${PRINT_ROOT_ID} *,
#${PRINT_ROOT_ID} *::before,
#${PRINT_ROOT_ID} *::after {
  box-sizing: border-box !important;
  max-width: 100% !important;
  overflow-wrap: break-word !important;
  word-break: break-word !important;
}
#${PRINT_ROOT_ID} .print-avoid-break,
#${PRINT_ROOT_ID} .resume-section,
#${PRINT_ROOT_ID} .resume-item,
#${PRINT_ROOT_ID} .resume-bullet {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
`.trim();

  type Html2PdfOptions =
    Parameters<InstanceType<typeof html2pdf.Worker>["set"]>[0] & {
      pagebreak?: {
        mode?: string | string[];
        before?: string | string[];
        after?: string | string[];
        avoid?: string | string[];
      };
    };

  const options: Html2PdfOptions = {
    margin: DEFAULT_MARGINS_MM,
    filename: safeName,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      // Higher scale improves sharpness without overly inflating PDF size.
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: Math.ceil(element.scrollWidth),
      windowHeight: element.scrollHeight,
      backgroundColor: "#ffffff",
      onclone: (doc: Document) => {
        const style = doc.createElement("style");
        style.setAttribute("data-export", "color-fallback");
        style.textContent = printOverrideStyles;
        doc.head.appendChild(style);
      },
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: {
      mode: ["css", "legacy"],
      avoid: [".print-avoid-break", ".resume-section", ".resume-item", ".resume-bullet"],
    },
  };

  await html2pdf()
    .set(options)
    .from(element)
    .save();
}

export function buildExportFilename(
  templateId: string,
  sourceFilename?: string,
): string {
  const base = sourceFilename
    ? sourceFilename.replace(/\.pdf$/i, "")
    : "resume";
  const sanitized = base.replace(/[^\w\-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${sanitized || "resume"}-${templateId}.pdf`;
}
