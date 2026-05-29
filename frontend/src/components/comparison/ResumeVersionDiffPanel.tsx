"use client";

import { compareResumeVersions } from "@/lib/resume";
import type { ResumeDiff, ResumeVersion } from "@/lib/types";

type ResumeVersionDiffPanelProps = {
  currentVersion: ResumeVersion | null;
  compareVersion: ResumeVersion | null;
  versions: ResumeVersion[];
  onCompareChange: (versionId: string) => void;
};

export function ResumeVersionDiffPanel({
  currentVersion,
  compareVersion,
  versions,
  onCompareChange,
}: ResumeVersionDiffPanelProps) {
  if (!currentVersion) {
    return (
      <EmptyState message="Upload a resume to start tracking changes." />
    );
  }

  const availableVersions = versions.filter(
    (version) => version.id !== currentVersion.id,
  );

  if (!compareVersion || !availableVersions.length) {
    return (
      <EmptyState message="Tailor your resume to create a version diff." />
    );
  }

  const diffs = compareResumeVersions(compareVersion.resume, currentVersion.resume);
  const grouped = groupDiffs(diffs);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Changes made</h2>
          <p className="text-sm text-slate-500">
            Comparing {compareVersion.label} → {currentVersion.label}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Compare with
          <select
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
            value={compareVersion.id}
            onChange={(event) => onCompareChange(event.target.value)}
          >
            {availableVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {diffs.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No text changes detected between these versions.
        </p>
      ) : (
        <div className="mt-6 grid gap-6">
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {section}
              </h3>
              <div className="mt-3 grid gap-3">
                {items.map((diff, index) => (
                  <div
                    key={`${section}-${index}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  >
                    {diff.before ? (
                      <p className="text-rose-700">
                        <span className="font-semibold">-</span> {diff.before}
                      </p>
                    ) : null}
                    {diff.after ? (
                      <p className="text-emerald-700">
                        <span className="font-semibold">+</span> {diff.after}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function groupDiffs(diffs: ResumeDiff[]) {
  return diffs.reduce<Record<string, ResumeDiff[]>>((acc, diff) => {
    if (!acc[diff.section]) {
      acc[diff.section] = [];
    }
    acc[diff.section].push(diff);
    return acc;
  }, {});
}

function EmptyState({ message }: { message: string }) {
  return (
    <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </section>
  );
}
