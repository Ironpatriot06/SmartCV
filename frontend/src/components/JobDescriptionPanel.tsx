"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type JobDescriptionPanelProps = {
  value: string;
  onChange: (value: string) => void;
  onTailor: () => void;
  disabled?: boolean;
  isTailoring?: boolean;
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

export function JobDescriptionPanel({
  value,
  onChange,
  onTailor,
  disabled = false,
  isTailoring = false,
}: JobDescriptionPanelProps) {
  const canTailor =
    !disabled && !isTailoring && value.trim().length > 0;

  return (
    <Card
      title="Job description"
      description="Paste the role you are applying for, then tailor your resume with AI."
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here…"
        rows={10}
        disabled={isTailoring}
        className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {isTailoring
            ? "Tailoring sections individually — this may take a minute…"
            : "Improves wording and ATS alignment without inventing experience."}
        </p>
        <Button
          onClick={onTailor}
          disabled={!canTailor}
          className="min-w-[8.5rem] gap-2"
        >
          {isTailoring ? (
            <>
              <Spinner />
              Tailoring…
            </>
          ) : (
            "Tailor Resume"
          )}
        </Button>
      </div>
    </Card>
  );
}
