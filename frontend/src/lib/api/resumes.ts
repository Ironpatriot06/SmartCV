import type { ResumeData } from "@/lib/types";

export type ResumeSummary = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type ResumeRecord = {
  id: string;
  name: string;
  resume_data: ResumeData;
  created_at?: string;
  updated_at?: string;
};

type ResumeCreateResponse = {
  id: string;
};

// Same-origin proxy avoids CORS in dev; override to hit FastAPI directly if needed.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const DIRECT_API_BASE =
  process.env.NEXT_PUBLIC_DIRECT_API_BASE_URL ?? "http://127.0.0.1:8000";
const DEV_FALLBACK_ENABLED =
  process.env.NODE_ENV !== "production" && API_BASE.startsWith("/");
const RESUMES_URL =
  process.env.NEXT_PUBLIC_RESUMES_URL ?? `${API_BASE}/resumes`;
const DIRECT_RESUMES_URL = `${DIRECT_API_BASE}/resumes`;
const RESUMES_PRIMARY_URL = DEV_FALLBACK_ENABLED
  ? DIRECT_RESUMES_URL
  : RESUMES_URL;
const RESUMES_FALLBACK_URL = DEV_FALLBACK_ENABLED
  ? RESUMES_URL
  : DIRECT_RESUMES_URL;

async function parseErrorDetail(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as {
      detail?: string | { msg?: string }[];
    };
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

export async function saveResume(
  name: string,
  resumeData: ResumeData,
): Promise<ResumeCreateResponse> {
  const response = await fetchWithDevFallback(
    RESUMES_PRIMARY_URL,
    RESUMES_FALLBACK_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, resume_data: resumeData }),
    },
  );

  if (!response.ok) {
    const detail = await parseErrorDetail(
      response,
      `Save failed (${response.status})`,
    );
    throw new Error(detail);
  }

  return (await response.json()) as ResumeCreateResponse;
}

export async function listResumes(): Promise<ResumeSummary[]> {
  const response = await fetchWithDevFallback(
    RESUMES_PRIMARY_URL,
    RESUMES_FALLBACK_URL,
    { method: "GET" },
  );

  if (!response.ok) {
    const detail = await parseErrorDetail(
      response,
      `Load resumes failed (${response.status})`,
    );
    throw new Error(detail);
  }

  return (await response.json()) as ResumeSummary[];
}

export async function getResume(resumeId: string): Promise<ResumeRecord> {
  const response = await fetchWithDevFallback(
    `${RESUMES_PRIMARY_URL}/${resumeId}`,
    `${RESUMES_FALLBACK_URL}/${resumeId}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const detail = await parseErrorDetail(
      response,
      `Load resume failed (${response.status})`,
    );
    throw new Error(detail);
  }

  return (await response.json()) as ResumeRecord;
}

export async function deleteResume(resumeId: string): Promise<void> {
  const response = await fetchWithDevFallback(
    `${RESUMES_PRIMARY_URL}/${resumeId}`,
    `${RESUMES_FALLBACK_URL}/${resumeId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    const detail = await parseErrorDetail(
      response,
      `Delete failed (${response.status})`,
    );
    throw new Error(detail);
  }
}
