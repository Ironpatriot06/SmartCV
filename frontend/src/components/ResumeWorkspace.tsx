"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { scoreResume, tailorResume, uploadResume } from "@/lib/api";
import {
  getResume,
  listResumes,
  saveResume,
  type ResumeSummary,
} from "@/lib/api/resumes";
import type { ExportTemplateId } from "@/lib/export/types";
import { cleanResumeData } from "@/lib/cleaning/text";
import {
  RESUME_HISTORY_STORAGE_KEY,
  buildTailorLabel,
  createResumeHistory,
  createResumeVersion,
  getResumeVersion,
  mergeTailoredWithOriginal,
  normalizeResumeHistory,
  resumeDataFromApi,
} from "@/lib/resume";
import type { AtsScoreResponse, ResumeData, ResumeHistory } from "@/lib/types";
import { ResumeUploader } from "@/components/ResumeUploader";
import { ResumeEditor } from "@/components/ResumeEditor";
import { JobDescriptionPanel } from "@/components/JobDescriptionPanel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  inputClassName,
  labelClassName,
} from "@/components/sections/shared/styles";
import { ExportButton } from "@/components/export/ExportButton";
import { AtsDashboard } from "@/components/ats/AtsDashboard";
import { ResumeVersionDiffPanel } from "@/components/comparison/ResumeVersionDiffPanel";
import { ResumeVersionSidebar } from "@/components/versioning/ResumeVersionSidebar";

type WorkspaceView = "editor" | "ats" | "compare";

export function ResumeWorkspace() {
  const [history, setHistory] = useState<ResumeHistory>(() =>
    loadStoredHistory(),
  );
  const [jobDescription, setJobDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<WorkspaceView>("editor");

  const [compareVersionId, setCompareVersionId] = useState(() => {
    const stored = loadStoredHistory();
    return getDefaultCompareVersionId(stored, stored.currentVersionId);
  });
  const [atsResult, setAtsResult] = useState<AtsScoreResponse | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [exportTemplate, setExportTemplate] = useState<ExportTemplateId>("ats");
  const [sourceFilename, setSourceFilename] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState(() => {
    const stored = loadStoredHistory();
    const current = getResumeVersion(stored, stored.currentVersionId);
    return current ? buildDefaultResumeName(current.resume) : "";
  });
  const [resumeLibrary, setResumeLibrary] = useState<ResumeSummary[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [loadingResumeId, setLoadingResumeId] = useState<string | null>(null);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);

  const hasResume = history.versions.length > 0;

  const currentVersion = useMemo(
    () => getResumeVersion(history, history.currentVersionId),
    [history],
  );
  const resolvedCompareVersionId = useMemo(
    () => resolveCompareVersionId(history, compareVersionId),
    [history, compareVersionId],
  );
  const compareVersion = useMemo(
    () => getResumeVersion(history, resolvedCompareVersionId),
    [history, resolvedCompareVersionId],
  );

  const editorResume = currentVersion?.resume ?? null;

  const exportData = editorResume ?? null;

  const displayedAtsResult = useMemo(() => {
    if (atsResult) return atsResult;
    if (currentVersion?.atsScore !== undefined) {
      return buildStoredAtsResult(currentVersion.atsScore);
    }
    return null;
  }, [atsResult, currentVersion]);

  const refreshResumeLibrary = useCallback(async () => {
    setIsLibraryLoading(true);
    setLibraryError(null);
    try {
      const resumes = await listResumes();
      setResumeLibrary(resumes);
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setIsLibraryLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshResumeLibrary();
    });
  }, [refreshResumeLibrary]);

  useEffect(() => {
    if (!history.versions.length) {
      localStorage.removeItem(RESUME_HISTORY_STORAGE_KEY);
      return;
    }
    localStorage.setItem(RESUME_HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);


  const updateResume = useCallback((data: ResumeData) => {
    setHistory((prev) => updateCurrentResume(prev, data));
    setAtsResult(null);
  }, []);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    setAtsResult(null);
    setActiveView("editor");
    try {
      const response = await uploadResume(file);
      const data = resumeDataFromApi(response.sections);
      const initialHistory = createResumeHistory(data, "Original Resume");
      setHistory(initialHistory);
      setCompareVersionId("");
      setSourceFilename(response.filename);
      setResumeName(buildDefaultResumeName(data));
      setActiveResumeId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveResume = async () => {
    if (!editorResume) return;
    const trimmedName = resumeName.trim() || buildDefaultResumeName(editorResume);

    setIsSavingResume(true);
    setLibraryError(null);
    try {
      const response = await saveResume(trimmedName, editorResume);
      setResumeName(trimmedName);
      setActiveResumeId(response.id);
      setSuccessMessage(`Saved "${trimmedName}" to your library.`);
      await refreshResumeLibrary();
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSavingResume(false);
    }
  };

  const handleLoadResume = async (resumeId: string) => {
    setLoadingResumeId(resumeId);
    setLibraryError(null);
    try {
      const record = await getResume(resumeId);
      const initialHistory = createResumeHistory(
        record.resume_data,
        "Original Resume",
      );
      setHistory(initialHistory);
      setCompareVersionId("");
      setAtsResult(null);
      setActiveView("editor");
      setSourceFilename(record.name);
      setResumeName(record.name);
      setActiveResumeId(record.id);
      setSuccessMessage(`Loaded "${record.name}".`);
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoadingResumeId(null);
    }
  };

  const handleTailor = async () => {
    if (!currentVersion || !jobDescription.trim()) return;

    setIsTailoring(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const snapshot = currentVersion.resume;
      const raw = await tailorResume(snapshot, jobDescription.trim());
      const validated = cleanResumeData(mergeTailoredWithOriginal(snapshot, raw));
      const label = buildTailorLabel(
        jobDescription,
        history.versions.length + 1,
      );
      const newVersion = createResumeVersion(validated, label);
      setHistory((prev) => ({
        currentVersionId: newVersion.id,
        versions: [...prev.versions, newVersion],
      }));
      setCompareVersionId(currentVersion.id);
      setAtsResult(null);
      setActiveView("compare");
      setSuccessMessage("Tailored resume saved as a new version.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tailoring failed");
    } finally {
      setIsTailoring(false);
    }
  };

  const handleScoreResume = async () => {
    if (!editorResume || !jobDescription.trim()) return;

    setIsScoring(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await scoreResume(editorResume, jobDescription.trim());
      setAtsResult(result);
      setHistory((prev) =>
        updateVersionScore(prev, prev.currentVersionId, result.score),
      );
      setActiveView("ats");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ATS scoring failed");
    } finally {
      setIsScoring(false);
    }
  };

  const handleSelectVersion = useCallback(
    (versionId: string) => {
      const selected = getResumeVersion(history, versionId);
      if (!selected) return;

      setHistory((prev) => ({
        ...prev,
        currentVersionId: versionId,
      }));
      setAtsResult(null);
      setCompareVersionId((prevCompare) => {
        if (prevCompare && prevCompare !== versionId) return prevCompare;
        return getDefaultCompareVersionId(history, versionId);
      });
    },
    [history],
  );

  const canCompare = history.versions.length > 1;
  const canScore = hasResume && jobDescription.trim().length > 0 && !isScoring;

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
        {currentVersion && (
          <p className="mt-2 text-xs text-slate-500">
            {currentVersion.label}
            {sourceFilename ? ` · ${sourceFilename}` : ""}
            {history.versions.length
              ? ` · Version ${getVersionIndex(history, currentVersion.id)} of ${history.versions.length}`
              : ""}
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
            filename={sourceFilename ?? null}
          />
          <JobDescriptionPanel
            value={jobDescription}
            onChange={(value) => {
              setJobDescription(value);
              setAtsResult(null);
            }}
            onTailor={handleTailor}
            disabled={!hasResume}
            isTailoring={isTailoring}
          />
          <Card
            title="My resumes"
            description="Save to MongoDB Atlas and reload them later."
          >
            <div className="grid gap-3">
              <div>
                <label className={labelClassName} htmlFor="resume-name">
                  Resume name
                </label>
                <input
                  id="resume-name"
                  value={resumeName}
                  onChange={(event) => setResumeName(event.target.value)}
                  placeholder="e.g., Backend Engineer Resume"
                  disabled={!editorResume || isSavingResume}
                  className={inputClassName}
                />
              </div>
              <Button
                onClick={handleSaveResume}
                disabled={!editorResume || isSavingResume}
                className="w-full"
              >
                {isSavingResume ? "Saving..." : "Save Resume"}
              </Button>
              {libraryError && (
                <p className="text-xs text-red-600">{libraryError}</p>
              )}
              <div className="mt-2 grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Saved resumes
                </p>
                {isLibraryLoading ? (
                  <p className="text-sm text-slate-500">
                    Loading saved resumes...
                  </p>
                ) : resumeLibrary.length ? (
                  resumeLibrary.map((resume) => {
                    const isActive = resume.id === activeResumeId;
                    const isLoading = resume.id === loadingResumeId;
                    return (
                      <button
                        key={resume.id}
                        type="button"
                        onClick={() => handleLoadResume(resume.id)}
                        disabled={isLoading}
                        className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left transition ${
                          isActive
                            ? "border-indigo-500 bg-indigo-50 text-slate-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">
                            {resume.name}
                          </span>
                          {isLoading ? (
                            <span className="text-xs text-slate-500">
                              Loading...
                            </span>
                          ) : isActive ? (
                            <span className="text-xs font-medium text-indigo-600">
                              Active
                            </span>
                          ) : null}
                        </div>
                        <span className="mt-1 text-xs text-slate-500">
                          {formatResumeTimestamp(
                            resume.updated_at ?? resume.created_at,
                          )}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">
                    No saved resumes yet.
                  </p>
                )}
              </div>
            </div>
          </Card>
          <ResumeVersionSidebar
            history={history}
            currentVersionId={history.currentVersionId}
            onSelect={handleSelectVersion}
          />
          <ExportButton
            data={exportData}
            templateId={exportTemplate}
            onTemplateChange={setExportTemplate}
            sourceFilename={sourceFilename ?? undefined}
            disabled={!hasResume || isTailoring}
            onError={setError}
            onSuccess={(message) => {
              setError(null);
              setSuccessMessage(message);
            }}
          />
        </aside>

        <main>
          <div className="mb-5 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <ViewButton
              active={activeView === "editor"}
              onClick={() => setActiveView("editor")}
            >
              Editor
            </ViewButton>
            <ViewButton
              active={activeView === "ats"}
              onClick={() => setActiveView("ats")}
            >
              ATS Score
            </ViewButton>
            <ViewButton
              active={activeView === "compare"}
              onClick={() => setActiveView("compare")}
              disabled={!canCompare}
            >
              Compare
            </ViewButton>
          </div>

          {editorResume ? (
            <>
              {activeView === "editor" && (
                <ResumeEditor
                  resume={editorResume}
                  onChange={updateResume}
                  readOnly={isTailoring}
                />
              )}
              {activeView === "ats" && (
                <AtsDashboard
                  result={displayedAtsResult}
                  isLoading={isScoring}
                  canScore={canScore}
                  onScore={handleScoreResume}
                />
              )}
              {activeView === "compare" && (
                <ResumeVersionDiffPanel
                  currentVersion={currentVersion}
                  compareVersion={compareVersion}
                  versions={history.versions}
                  onCompareChange={setCompareVersionId}
                />
              )}
            </>
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

function ViewButton({
  active,
  children,
  disabled = false,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-slate-950 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function updateCurrentResume(history: ResumeHistory, resume: ResumeData) {
  if (!history.currentVersionId) return history;
  return {
    ...history,
    versions: history.versions.map((version) =>
      version.id === history.currentVersionId
        ? { ...version, resume, atsScore: undefined }
        : version,
    ),
  };
}

function updateVersionScore(
  history: ResumeHistory,
  versionId: string,
  score: number,
) {
  if (!versionId) return history;
  return {
    ...history,
    versions: history.versions.map((version) =>
      version.id === versionId ? { ...version, atsScore: score } : version,
    ),
  };
}

function getDefaultCompareVersionId(
  history: ResumeHistory,
  currentVersionId: string,
) {
  const fallback = history.versions
    .filter((version) => version.id !== currentVersionId)
    .at(-1);
  return fallback?.id ?? "";
}

function buildStoredAtsResult(score: number): AtsScoreResponse {
  return {
    score,
    jdMatchPercentage: 0,
    healthLabel: "Saved score",
    matchedKeywords: [],
    missingKeywords: [],
    strengths: [],
    weaknesses: [],
    recommendations: [],
    scoreBreakdown: [],
    metrics: {},
  };
}

function getVersionIndex(history: ResumeHistory, versionId: string) {
  const index = history.versions.findIndex((version) => version.id === versionId);
  return index === -1 ? history.versions.length : index + 1;
}

function resolveCompareVersionId(
  history: ResumeHistory,
  compareVersionId: string,
) {
  if (!history.currentVersionId) return "";
  const exists = history.versions.some((version) => version.id === compareVersionId);
  if (compareVersionId && compareVersionId !== history.currentVersionId && exists) {
    return compareVersionId;
  }
  return getDefaultCompareVersionId(history, history.currentVersionId);
}

function loadStoredHistory(): ResumeHistory {
  if (typeof window === "undefined") {
    return { currentVersionId: "", versions: [] };
  }
  const stored = localStorage.getItem(RESUME_HISTORY_STORAGE_KEY);
  if (!stored) {
    return { currentVersionId: "", versions: [] };
  }
  try {
    const parsed = normalizeResumeHistory(JSON.parse(stored));
    if (parsed) return parsed;
  } catch {
    // Ignore malformed history payloads.
  }
  return { currentVersionId: "", versions: [] };
}

function buildDefaultResumeName(resume: ResumeData) {
  const contactName = resume.contact?.name?.trim();
  if (contactName) return `${contactName} Resume`;
  return "Resume";
}

function formatResumeTimestamp(iso?: string) {
  if (!iso) return "Saved recently";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Saved recently";
  return `Saved ${date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}
