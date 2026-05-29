"use client";

import type { KeywordMatch } from "@/lib/types";

type MissingSkillsProps = {
  keywords: KeywordMatch[];
};

export function MissingSkills({ keywords }: MissingSkillsProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">
            Missing keywords
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add these only when they truthfully reflect your background.
          </p>
        </div>
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
          {keywords.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.length ? (
          keywords.map((item) => (
            <span
              key={`${item.keyword}-${item.category}`}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-800"
            >
              {item.keyword}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No major missing terms found for the current job description.
          </p>
        )}
      </div>
    </section>
  );
}
