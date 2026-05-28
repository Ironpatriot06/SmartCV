"use client";

import type { ExportTemplateId } from "@/lib/export/types";
import { EXPORT_TEMPLATES } from "@/lib/export/types";

type TemplateSelectorProps = {
  value: ExportTemplateId;
  onChange: (value: ExportTemplateId) => void;
  disabled?: boolean;
};

export function TemplateSelector({
  value,
  onChange,
  disabled = false,
}: TemplateSelectorProps) {
  const selected = EXPORT_TEMPLATES.find((t) => t.id === value);

  return (
    <div className="space-y-1">
      <label
        htmlFor="export-template"
        className="block text-xs font-medium text-slate-600"
      >
        PDF template
      </label>
      <select
        id="export-template"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as ExportTemplateId)}
        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {EXPORT_TEMPLATES.map((template) => (
          <option key={template.id} value={template.id}>
            {template.label}
          </option>
        ))}
      </select>
      {selected && (
        <p className="text-xs text-slate-500">{selected.description}</p>
      )}
    </div>
  );
}
