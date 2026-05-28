"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createExperienceItem } from "@/lib/resume";
import type { ExperienceItem } from "@/lib/types";
import { BulletListEditor } from "./shared/BulletListEditor";
import { FormField } from "./shared/FormField";
import { ItemCard } from "./shared/ItemCard";

type ExperienceSectionProps = {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
};

export function ExperienceSection({ items, onChange }: ExperienceSectionProps) {
  const updateItem = (id: string, patch: Partial<ExperienceItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([...items, createExperienceItem()]);
  };

  return (
    <Card
      title="Experience"
      description="Roles with company, dates, and achievement bullets."
    >
      <div className="space-y-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            title={item.title || "New role"}
            subtitle={item.company || "Company name"}
            onRemove={() => removeItem(item.id)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="Job title"
                value={item.title}
                onChange={(title) => updateItem(item.id, { title })}
                placeholder="Software Engineer"
              />
              <FormField
                label="Company"
                value={item.company}
                onChange={(company) => updateItem(item.id, { company })}
                placeholder="Acme Inc."
              />
              <FormField
                label="Location"
                value={item.location ?? ""}
                onChange={(location) => updateItem(item.id, { location })}
                placeholder="San Francisco, CA"
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Start"
                  value={item.startDate ?? ""}
                  onChange={(startDate) => updateItem(item.id, { startDate })}
                  placeholder="Jan 2022"
                />
                <FormField
                  label="End"
                  value={item.endDate ?? ""}
                  onChange={(endDate) => updateItem(item.id, { endDate })}
                  placeholder="Present"
                />
              </div>
            </div>
            <div className="mt-4">
              <BulletListEditor
                label="Achievements"
                items={item.bullets}
                onChange={(bullets) => updateItem(item.id, { bullets })}
              />
            </div>
          </ItemCard>
        ))}
        <Button variant="secondary" className="w-full" onClick={addItem}>
          + Add experience
        </Button>
      </div>
    </Card>
  );
}
