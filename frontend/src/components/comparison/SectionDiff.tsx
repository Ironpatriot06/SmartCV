"use client";

import { BulletDiff } from "@/components/comparison/BulletDiff";

type SectionDiffProps = {
  title: string;
  before: string[];
  after: string[];
};

export function SectionDiff({ title, before, after }: SectionDiffProps) {
  const count = Math.max(before.length, after.length);
  const changed = Array.from({ length: count }).filter((_, index) => before[index] !== after[index]).length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          {changed} changed
        </span>
      </div>
      <div className="grid gap-2">
        {count ? (
          Array.from({ length: count }).map((_, index) => (
            <BulletDiff
              key={`${title}-${index}-${before[index] ?? ""}-${after[index] ?? ""}`}
              before={before[index]}
              after={after[index]}
            />
          ))
        ) : (
          <p className="text-sm text-slate-500">No content in this section.</p>
        )}
      </div>
    </section>
  );
}
