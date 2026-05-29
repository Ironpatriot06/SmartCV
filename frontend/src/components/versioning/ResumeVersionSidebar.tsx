"use client";

import type { ResumeHistory, ResumeVersion } from "@/lib/types";
import { Card } from "@/components/ui/Card";

type ResumeVersionSidebarProps = {
  history: ResumeHistory;
  currentVersionId: string;
  onSelect: (versionId: string) => void;
};

export function ResumeVersionSidebar({
  history,
  currentVersionId,
  onSelect,
}: ResumeVersionSidebarProps) {
  return (
    <Card
      title="Resume versions"
      description="Switch between saved versions instantly."
    >
      {history.versions.length ? (
        <div className="grid gap-2">
          {history.versions.map((version, index) => {
            const isActive = version.id === currentVersionId;
            const meta = formatVersionMeta(version, index === 0);
            return (
              <button
                key={version.id}
                type="button"
                onClick={() => onSelect(version.id)}
                className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left transition ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">●</span>
                  <span className="text-sm font-semibold">{version.label}</span>
                </div>
                <div
                  className={`mt-1 text-xs ${
                    isActive ? "text-slate-200" : "text-slate-500"
                  }`}
                >
                  {meta}
                  {version.atsScore !== undefined
                    ? ` · ATS: ${Math.round(version.atsScore)}`
                    : ""}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Upload a resume to start tracking versions.
        </p>
      )}
    </Card>
  );
}

function formatVersionMeta(version: ResumeVersion, isOriginal: boolean) {
  const timestamp = formatTime(version.createdAt);
  if (!timestamp) {
    return isOriginal ? "Original resume" : "Saved version";
  }
  return isOriginal ? `Uploaded ${timestamp}` : `Saved ${timestamp}`;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
