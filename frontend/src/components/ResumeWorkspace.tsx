"use client";

import { useCallback, useMemo, useState } from "react";
import { tailorResume, uploadResume } from "@/lib/api";
import type { ExportTemplateId } from "@/lib/export/types";
import {
  createResumeDocument,
  EMPTY_RESUME_DATA,
  mergeTailoredWithOriginal,
  nextResumeVersion,
  resumeDataFromApi,
} from "@/lib/resume";
import type { ResumeData, ResumeDocument } from "@/lib/types";
import { ResumeUploader } from "@/components/ResumeUploader";
import { ResumeEditor } from "@/components/ResumeEditor";
import { JobDescriptionPanel } from "@/components/JobDescriptionPanel";
import { TailorPreviewBanner } from "@/components/TailorPreviewBanner";
import { ExportButton } from "@/components/export/ExportButton";

export function ResumeWorkspace() {
  const [document, setDocument] = useState<ResumeDocument>(() =>
    createResumeDocument(EMPTY_RESUME_DATA),
  );
  const [jobDescription, setJobDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [originalSnapshot, setOriginalSnapshot] = useState<ResumeData | null>(
    null,
  );
  const [tailoredPreview, setTailoredPreview] = useState<ResumeData | null>(
    null,
  );
  const [viewingOriginal, setViewingOriginal] = useState(false);
  const [exportTemplate, setExportTemplate] = useState<ExportTemplateId>("ats");

  const hasResume = document !== null;
  const inPreviewMode = tailoredPreview !== null && originalSnapshot !== null;

  const editorResume = useMemo(() => {
    if (!document) return null;
    if (!inPreviewMode) return document.data;
    return viewingOriginal ? originalSnapshot : tailoredPreview;
  }, [document, inPreviewMode, viewingOriginal, originalSnapshot, tailoredPreview]);

  const exportData = editorResume ?? document?.data ?? null;

  const updateResume = useCallback(
    (data: ResumeData) => {
      setDocument((prev) =>
        prev ? nextResumeVersion(prev, data) : createResumeDocument(data),
      );
      if (inPreviewMode) {
        setTailoredPreview(data);
      }
    },
    [inPreviewMode],
  );

  const clearPreview = useCallback(() => {
    setOriginalSnapshot(null);
    setTailoredPreview(null);
    setViewingOriginal(false);
  }, []);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    clearPreview();
    try {
      const response = await uploadResume(file);
      const data = resumeDataFromApi(response.sections);
      setDocument(createResumeDocument(data, response.filename));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTailor = async () => {
    if (!document || !jobDescription.trim()) return;

    setIsTailoring(true);
    setError(null);
    setSuccessMessage(null);

    const snapshot = document.data;
    setOriginalSnapshot(snapshot);

    try {
      const raw = await tailorResume(snapshot, jobDescription.trim());
      const validated = mergeTailoredWithOriginal(snapshot, raw);
      setTailoredPreview(validated);
      setViewingOriginal(false);
      setSuccessMessage(
        "Resume tailored. Review the preview, then apply or discard.",
      );
    } catch (err) {
      clearPreview();
      setError(err instanceof Error ? err.message : "Tailoring failed");
    } finally {
      setIsTailoring(false);
    }
  };

  const handleApplyTailored = () => {
    if (!document || !tailoredPreview) return;
    setDocument(nextResumeVersion(document, tailoredPreview));
    setSuccessMessage("Tailored resume applied. You can keep editing any section.");
    clearPreview();
  };

  const handleDiscardTailored = () => {
    clearPreview();
    setSuccessMessage(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Resume Automator
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Upload a PDF, review structured sections, edit fields, and tailor your
          resume for a specific role with AI.
        </p>
        {document && (
          <p className="mt-2 text-xs text-slate-500">
            Document v{document.version}
            {document.sourceFilename ? ` · ${document.sourceFilename}` : ""}
            {inPreviewMode ? " · preview mode" : ""}
          </p>
        )}
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {successMessage && !error && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {successMessage}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
        <aside className="flex flex-col gap-6">
          <ResumeUploader
            onUpload={handleUpload}
            isUploading={isUploading}
            filename={document?.sourceFilename ?? null}
          />
          <JobDescriptionPanel
            value={jobDescription}
            onChange={setJobDescription}
            onTailor={handleTailor}
            disabled={!hasResume}
            isTailoring={isTailoring}
          />
          <ExportButton
            data={exportData}
            templateId={exportTemplate}
            onTemplateChange={setExportTemplate}
            sourceFilename={document?.sourceFilename}
            disabled={!hasResume || isTailoring}
            onError={setError}
            onSuccess={(message) => {
              setError(null);
              setSuccessMessage(message);
            }}
          />
        </aside>

        <main>
          {inPreviewMode && (
            <TailorPreviewBanner
              viewingOriginal={viewingOriginal}
              onToggleView={() => setViewingOriginal((v) => !v)}
              onApply={handleApplyTailored}
              onDiscard={handleDiscardTailored}
            />
          )}

          {editorResume ? (
            <ResumeEditor
              resume={editorResume}
              onChange={updateResume}
              readOnly={isTailoring || (inPreviewMode && viewingOriginal)}
            />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
              <p className="text-sm text-slate-500">
                Upload a PDF to parse and edit structured resume data.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
