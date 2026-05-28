export type ExportTemplateId = "ats" | "modern";

export const EXPORT_TEMPLATES: {
  id: ExportTemplateId;
  label: string;
  description: string;
}[] = [
  {
    id: "ats",
    label: "ATS",
    description: "Single-column, minimal styling for applicant tracking systems",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Clean hierarchy with subtle visual polish",
  },
];
