"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createProjectItem } from "@/lib/resume";
import type { ProjectItem } from "@/lib/types";
import { BulletListEditor } from "./shared/BulletListEditor";
import { FormField } from "./shared/FormField";
import { ItemCard } from "./shared/ItemCard";
import { inputClassName, labelClassName } from "./shared/styles";

type ProjectsSectionProps = {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
};

export function ProjectsSection({ items, onChange }: ProjectsSectionProps) {
  const updateItem = (id: string, patch: Partial<ProjectItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([...items, createProjectItem()]);
  };

  const updateTechnologies = (id: string, raw: string) => {
    const technologies = raw
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean);
    updateItem(id, { technologies });
  };

  return (
    <Card title="Projects" description="Portfolio work with tech stack and outcomes.">
      <div className="space-y-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            title={item.name || "New project"}
            subtitle={
              item.technologies.length > 0
                ? item.technologies.join(" · ")
                : undefined
            }
            onRemove={() => removeItem(item.id)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="Project name"
                value={item.name}
                onChange={(name) => updateItem(item.id, { name })}
                placeholder="Resume Automator"
              />
              <FormField
                label="URL"
                type="url"
                value={item.url ?? ""}
                onChange={(url) => updateItem(item.id, { url })}
                placeholder="https://github.com/…"
              />
            </div>
            <label className="mt-3 block">
              <span className={labelClassName}>Technologies (comma-separated)</span>
              <input
                value={item.technologies.join(", ")}
                onChange={(e) => updateTechnologies(item.id, e.target.value)}
                placeholder="TypeScript, Next.js, FastAPI"
                className={inputClassName}
              />
            </label>
            <label className="mt-3 block">
              <span className={labelClassName}>Description</span>
              <textarea
                value={item.description}
                onChange={(e) =>
                  updateItem(item.id, { description: e.target.value })
                }
                rows={2}
                placeholder="Brief project overview…"
                className={`${inputClassName} resize-y leading-relaxed`}
              />
            </label>
            <div className="mt-4">
              <BulletListEditor
                label="Highlights"
                items={item.bullets}
                onChange={(bullets) => updateItem(item.id, { bullets })}
              />
            </div>
          </ItemCard>
        ))}
        <Button variant="secondary" className="w-full" onClick={addItem}>
          + Add project
        </Button>
      </div>
    </Card>
  );
}
