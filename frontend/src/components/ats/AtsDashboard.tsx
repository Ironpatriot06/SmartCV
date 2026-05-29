"use client";

import type { AtsScoreResponse } from "@/lib/types";
import { AtsScoreCard } from "@/components/ats/AtsScoreCard";
import { KeywordMatch } from "@/components/ats/KeywordMatch";
import { MissingSkills } from "@/components/ats/MissingSkills";
import { ScoreBreakdown } from "@/components/ats/ScoreBreakdown";

type AtsDashboardProps = {
  result: AtsScoreResponse | null;
  isLoading: boolean;
  canScore: boolean;
  onScore: () => void;
};

const EMPTY_RESULT: AtsScoreResponse = {
  score: 0,
  jdMatchPercentage: 0,
  healthLabel: "Not scored",
  matchedKeywords: [],
  missingKeywords: [],
  strengths: [],
  weaknesses: [],
  recommendations: [],
  scoreBreakdown: [],
  metrics: {},
};

export function AtsDashboard({
  result,
  isLoading,
  canScore,
  onScore,
}: AtsDashboardProps) {
  const current = result ?? EMPTY_RESULT;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            ATS alignment dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Score the visible resume against the pasted job description.
          </p>
        </div>
        <button
          type="button"
          onClick={onScore}
          disabled={!canScore || isLoading}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Scoring..." : "Run ATS Score"}
        </button>
      </div>

      {(result || isLoading) && (
        <>
          <AtsScoreCard result={current} isLoading={isLoading} />
          {result && (
            <>
              <div className="grid gap-5 xl:grid-cols-2">
                <KeywordMatch keywords={result.matchedKeywords} />
                <MissingSkills keywords={result.missingKeywords} />
              </div>
              <ScoreBreakdown result={result} />
              <RecommendationPanel result={result} />
            </>
          )}
        </>
      )}

      {!result && !isLoading && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
          <p className="text-sm text-slate-500">
            Paste a job description and run a score to reveal keyword alignment,
            health metrics, and prioritized recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

function RecommendationPanel({ result }: { result: AtsScoreResponse }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <ListPanel title="Strengths" tone="green" items={result.strengths} />
      <ListPanel title="Weaknesses" tone="red" items={result.weaknesses} />
      <ListPanel
        title="Recommendations"
        tone="blue"
        items={result.recommendations}
      />
    </section>
  );
}

function ListPanel({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "green" | "red" | "blue";
  items: string[];
}) {
  const toneClasses = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    red: "border-red-200 bg-red-50 text-red-900",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
  };

  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6">
        {items.length ? (
          items.map((item) => <li key={item}>{item}</li>)
        ) : (
          <li>No major issues found.</li>
        )}
      </ul>
    </div>
  );
}
