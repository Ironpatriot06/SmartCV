"use client";

import { Card } from "@/components/ui/Card";
import { inputClassName } from "./shared/styles";

type SummarySectionProps = {
  summary: string;
  onChange: (summary: string) => void;
};

export function SummarySection({ summary, onChange }: SummarySectionProps) {
  return (
    <Card
      title="Summary"
      description="Professional summary or objective — used for tailoring and ATS keyword alignment."
    >
      <textarea
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a concise professional summary…"
        rows={4}
        className={`${inputClassName} resize-y leading-relaxed`}
      />
    </Card>
  );
}
