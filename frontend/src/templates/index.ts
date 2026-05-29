import type { ComponentType } from "react";
import type { ExportTemplateId } from "@/lib/export/types";
import { AtsTemplate } from "./AtsTemplate";
import { ModernTemplate } from "./ModernTemplate";
import { NewTemplate } from "./NewTemplate";
import type { ResumeTemplateProps } from "./types";

export type { ResumeTemplateProps } from "./types";
export { PRINT_ROOT_ID } from "./types";
export { AtsTemplate } from "./AtsTemplate";
export { ModernTemplate } from "./ModernTemplate";
export { NewTemplate } from "./NewTemplate";

const TEMPLATE_MAP: Record<
  ExportTemplateId,
  ComponentType<ResumeTemplateProps>
> = {
  ats: AtsTemplate,
  modern: ModernTemplate,
  good: NewTemplate,
};

export function getTemplateComponent(
  id: ExportTemplateId,
): ComponentType<ResumeTemplateProps> {
  return TEMPLATE_MAP[id];
}
