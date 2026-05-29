"use client";

import type { AtsScoreResponse } from "@/lib/types";

type AtsScoreCardProps = {
  result: AtsScoreResponse;
  isLoading?: boolean;
};

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-700";
  if (score >= 72) return "text-sky-700";
  if (score >= 58) return "text-amber-700";
  return "text-red-700";
}

export function AtsScoreCard({ result, isLoading = false }: AtsScoreCardProps) {
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (result.score / 100) * circumference;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            ATS score
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {result.healthLabel} alignment
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Deterministic scoring across job keywords, section completeness,
            bullet strength, formatting, and role relevance.
          </p>
        </div>
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="44"
              strokeWidth="9"
              className="fill-none stroke-slate-100"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="fill-none stroke-emerald-500 transition-all"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-semibold ${scoreColor(result.score)}`}>
              {isLoading ? "--" : result.score}
            </span>
            <span className="text-xs text-slate-500">out of 100</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="JD match" value={`${result.jdMatchPercentage}%`} />
        <Metric label="Matched terms" value={String(result.matchedKeywords.length)} />
        <Metric label="Missing terms" value={String(result.missingKeywords.length)} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
