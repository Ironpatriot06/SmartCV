import type { ResumeData, ResumeDocument } from "@/lib/types";

/** Serializable snapshot for export, ATS scoring, or API payloads. */
export type ResumeSnapshot = ResumeDocument;

export function toExportPayload(document: ResumeDocument): ResumeData {
  return structuredClone(document.data);
}

export { buildExportFilename, exportResumePdf } from "./export/pdf";
export type { ExportResumePdfOptions } from "./export/pdf";
export { EXPORT_TEMPLATES, type ExportTemplateId } from "./export/types";
