import type { ResumeData, TailorResponse, UploadResponse } from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

// Same-origin proxy avoids CORS in dev; override to hit FastAPI directly if needed.
const UPLOAD_URL =
  process.env.NEXT_PUBLIC_UPLOAD_URL ?? `${API_BASE}/upload`;

const TAILOR_URL =
  process.env.NEXT_PUBLIC_TAILOR_URL ?? `${API_BASE}/tailor`;

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
  const response = await fetch(TAILOR_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, jobDescription }),
  });

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
