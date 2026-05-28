"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { buildExportFilename, exportResumePdf } from "@/lib/export/pdf";
import type { ExportTemplateId } from "@/lib/export/types";
import type { ResumeData } from "@/lib/types";
import { TemplateSelector } from "./TemplateSelector";
import { ResumePrintArea } from "./ResumePrintArea";

type ExportButtonProps = {
  data: ResumeData | null;
  templateId: ExportTemplateId;
  onTemplateChange: (id: ExportTemplateId) => void;
  sourceFilename?: string;
  disabled?: boolean;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function ExportButton({
  data,
  templateId,
  onTemplateChange,
  sourceFilename,
  disabled = false,
  onError,
  onSuccess,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data || isExporting) return;

    setIsExporting(true);

    try {
      // Allow React to paint the print template before html2canvas captures it.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const filename = buildExportFilename(templateId, sourceFilename);
      await exportResumePdf({ filename });
      onSuccess(`Downloaded ${filename}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = Boolean(data) && !disabled && !isExporting;

  return (
    <>
      {data && <ResumePrintArea data={data} templateId={templateId} />}

      <Card
        title="Export PDF"
        description="Download a polished resume from your current content."
      >
        <div className="space-y-4">
          <TemplateSelector
            value={templateId}
            onChange={onTemplateChange}
            disabled={disabled || isExporting}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {isExporting
                ? "Generating PDF — this may take a few seconds…"
                : "Exports the selected template, not the editor form."}
            </p>
            <Button
              onClick={handleExport}
              disabled={!canExport}
              variant="secondary"
              className="min-w-[8.5rem] gap-2"
            >
              {isExporting ? (
                <>
                  <Spinner />
                  Exporting…
                </>
              ) : (
                "Export PDF"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
