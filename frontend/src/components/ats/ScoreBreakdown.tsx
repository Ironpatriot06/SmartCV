"use client";

import type { AtsScoreResponse } from "@/lib/types";

type ScoreBreakdownProps = {
  result: AtsScoreResponse;
};

export function ScoreBreakdown({ result }: ScoreBreakdownProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">Score reasoning</h2>
      <div className="mt-4 grid gap-4">
        {result.scoreBreakdown.map((component) => (
          <div key={component.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {component.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Weight {component.weight}% · {component.rationale}
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-950">
                {component.score}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{ width: `${component.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
