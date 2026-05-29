import { createId } from "@/lib/ids";
import type { ResumeData, ResumeHistory, ResumeVersion } from "@/lib/types";

export const RESUME_HISTORY_STORAGE_KEY = "smartcv-history";

export function createResumeVersion(
  resume: ResumeData,
  label: string,
  atsScore?: number,
): ResumeVersion {
  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    label,
    atsScore,
    resume,
  };
}

export function createResumeHistory(
  resume: ResumeData,
  label = "Original Resume",
): ResumeHistory {
  const version = createResumeVersion(resume, label);
  return {
    currentVersionId: version.id,
    versions: [version],
  };
}

export function getResumeVersion(
  history: ResumeHistory,
  versionId: string | null | undefined,
): ResumeVersion | null {
  if (!versionId) return null;
  return history.versions.find((version) => version.id === versionId) ?? null;
}

export function normalizeResumeHistory(
  candidate: unknown,
): ResumeHistory | null {
  if (!candidate || typeof candidate !== "object") return null;
  const history = candidate as ResumeHistory;
  if (typeof history.currentVersionId !== "string") return null;
  if (!Array.isArray(history.versions)) return null;

  const versions = history.versions.filter((version) => {
    if (!version || typeof version !== "object") return false;
    return (
      typeof version.id === "string" &&
      typeof version.createdAt === "string" &&
      typeof version.label === "string" &&
      typeof version.resume === "object"
    );
  });

  if (!versions.length) return null;

  const currentVersionId = versions.some(
    (version) => version.id === history.currentVersionId,
  )
    ? history.currentVersionId
    : versions[versions.length - 1].id;

  return {
    currentVersionId,
    versions,
  };
}

export function extractRoleFromJobDescription(
  jobDescription: string,
): string | null {
  const lines = jobDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const labeledMatch = lines
    .map((line) => line.match(/^(role|position|title)\s*[:\-]\s*(.+)$/i))
    .find(Boolean);

  if (labeledMatch?.[2]) {
    return sanitizeRole(labeledMatch[2]);
  }

  const phraseMatch = lines
    .map((line) =>
      line.match(
        /(looking for|seeking|hiring|need)\s+(an?|the)\s+([a-z0-9 /+&-]{3,80})/i,
      ),
    )
    .find(Boolean);

  if (phraseMatch?.[3]) {
    return sanitizeRole(phraseMatch[3]);
  }

  if (lines.length) {
    const firstLine = sanitizeRole(lines[0]);
    if (firstLine.length <= 60 && /[a-z]/i.test(firstLine)) {
      return firstLine;
    }
  }

  return null;
}

export function buildTailorLabel(
  jobDescription: string,
  versionNumber: number,
): string {
  const role = extractRoleFromJobDescription(jobDescription);
  if (role) {
    return `Tailored for ${role}`;
  }
  return `Tailored Resume #${versionNumber}`;
}

function sanitizeRole(role: string) {
  const trimmed = role.replace(/\s+/g, " ").trim();
  const cutoff = trimmed.split(/\s+(to|who|with|that|where)\b/i)[0] ?? trimmed;
  return cutoff.replace(/[.,;:]+$/, "").trim();
}
