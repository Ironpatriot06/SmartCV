"use client";

import type { KeywordMatch as KeywordMatchType } from "@/lib/types";

type KeywordMatchProps = {
  keywords: KeywordMatchType[];
};

export function KeywordMatch({ keywords }: KeywordMatchProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">
            Matched keywords
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Terms found across skills, experience, projects, and summary.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {keywords.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.length ? (
          keywords.map((item) => (
            <span
              key={`${item.keyword}-${item.category}`}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
              title={`${item.category.replace("_", " ")} · ${item.count} match${item.count === 1 ? "" : "es"}`}
            >
              {item.keyword}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            Run ATS scoring to see matched role keywords.
          </p>
        )}
      </div>
    </section>
  );
}
