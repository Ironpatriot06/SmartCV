import type {
  AtsScoreResponse,
  ResumeData,
  TailorResponse,
  UploadResponse,
} from "@/lib/types";

// Same-origin proxy avoids CORS in dev; override to hit FastAPI directly if needed.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const DIRECT_API_BASE =
  process.env.NEXT_PUBLIC_DIRECT_API_BASE_URL ?? "http://127.0.0.1:8000";
const DEV_FALLBACK_ENABLED =
  process.env.NODE_ENV !== "production" && API_BASE.startsWith("/");
const UPLOAD_URL =
  process.env.NEXT_PUBLIC_UPLOAD_URL ?? `${API_BASE}/upload`;

const TAILOR_URL =
  process.env.NEXT_PUBLIC_TAILOR_URL ?? `${API_BASE}/tailor`;
const DIRECT_TAILOR_URL = `${DIRECT_API_BASE}/tailor`;
const TAILOR_PRIMARY_URL = DEV_FALLBACK_ENABLED ? DIRECT_TAILOR_URL : TAILOR_URL;
const TAILOR_FALLBACK_URL = DEV_FALLBACK_ENABLED ? TAILOR_URL : DIRECT_TAILOR_URL;

const ATS_SCORE_URL =
  process.env.NEXT_PUBLIC_ATS_SCORE_URL ?? `${API_BASE}/ats/score`;

async function parseErrorDetail(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string | { msg?: string }[] };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) {
      return body.detail.map((d) => d.msg).join("; ");
    }
  } catch {
    // ignore JSON parse errors
  }
  return fallback;
}

async function fetchWithDevFallback(
  primaryUrl: string,
  fallbackUrl: string,
  init: RequestInit,
): Promise<Response> {
  if (!DEV_FALLBACK_ENABLED || primaryUrl === fallbackUrl) {
    return fetch(primaryUrl, init);
  }

  try {
    const response = await fetch(primaryUrl, init);
    if (response.ok || response.status < 500) {
      return response;
    }
  } catch {
    // Ignore fetch errors and try the direct backend in dev.
  }

  return fetch(fallbackUrl, init);
}

export async function uploadResume(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const detail = await parseErrorDetail(
      response,
      `Upload failed (${response.status})`,
    );
    throw new Error(detail);
  }

  return (await response.json()) as UploadResponse;
}

export async function tailorResume(
  resume: ResumeData,
  jobDescription: string,
): Promise<ResumeData> {
  const response = await fetchWithDevFallback(
    TAILOR_PRIMARY_URL,
    TAILOR_FALLBACK_URL,
    {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, jobDescription }),
    },
  );

  if (!response.ok) {
    const detail = await parseErrorDetail(
      response,
      `Tailoring failed (${response.status})`,
    );
    throw new Error(detail);
  }

  const data = (await response.json()) as TailorResponse;
  return data.tailoredResume;
}

export async function scoreResume(
  resume: ResumeData,
  jobDescription: string,
): Promise<AtsScoreResponse> {
  const response = await fetch(ATS_SCORE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, jobDescription }),
  });

  if (!response.ok) {
    const detail = await parseErrorDetail(
      response,
      `ATS scoring failed (${response.status})`,
    );
    throw new Error(detail);
  }

  return (await response.json()) as AtsScoreResponse;
}
