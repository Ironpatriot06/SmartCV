"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { inputClassName } from "./shared/styles";

type SkillsSectionProps = {
  skills: string[];
  onChange: (skills: string[]) => void;
};

export function SkillsSection({ skills, onChange }: SkillsSectionProps) {
  const [draft, setDraft] = useState("");

  const addSkill = (raw: string) => {
    const skill = raw.trim();
    if (!skill || skills.includes(skill)) return;
    onChange([...skills, skill]);
    setDraft("");
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, value: string) => {
    const next = [...skills];
    next[index] = value;
    onChange(next);
  };

  return (
    <Card
      title="Skills"
      description="Discrete skills for ATS matching and tailoring."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-900"
          >
            <input
              value={skill}
              onChange={(e) => updateSkill(index, e.target.value)}
              className="w-auto min-w-[4rem] border-none bg-transparent p-0 text-xs focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="text-indigo-400 hover:text-red-600"
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addSkill(draft);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a skill and press Enter"
          className={inputClassName}
        />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>
    </Card>
  );
}
