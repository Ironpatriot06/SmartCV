"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createEducationItem } from "@/lib/resume";
import type { EducationItem } from "@/lib/types";
import { BulletListEditor } from "./shared/BulletListEditor";
import { FormField } from "./shared/FormField";
import { ItemCard } from "./shared/ItemCard";

type EducationSectionProps = {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
};

export function EducationSection({ items, onChange }: EducationSectionProps) {
  const updateItem = (id: string, patch: Partial<EducationItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([...items, createEducationItem()]);
  };

  return (
    <Card title="Education" description="Degrees, institutions, and highlights.">
      <div className="space-y-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            title={item.degree || "New degree"}
            subtitle={item.institution || "Institution"}
            onRemove={() => removeItem(item.id)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="Degree"
                value={item.degree}
                onChange={(degree) => updateItem(item.id, { degree })}
                placeholder="B.S. Computer Science"
              />
              <FormField
                label="Institution"
                value={item.institution}
                onChange={(institution) => updateItem(item.id, { institution })}
                placeholder="University of Example"
              />
              <FormField
                label="Field of study"
                value={item.field ?? ""}
                onChange={(field) => updateItem(item.id, { field })}
                placeholder="Computer Science"
              />
              <FormField
                label="Location"
                value={item.location ?? ""}
                onChange={(location) => updateItem(item.id, { location })}
              />
              <FormField
                label="Start"
                value={item.startDate ?? ""}
                onChange={(startDate) => updateItem(item.id, { startDate })}
                placeholder="2018"
              />
              <FormField
                label="End"
                value={item.endDate ?? ""}
                onChange={(endDate) => updateItem(item.id, { endDate })}
                placeholder="2022"
              />
              <FormField
                label="GPA"
                value={item.gpa ?? ""}
                onChange={(gpa) => updateItem(item.id, { gpa })}
                placeholder="3.8"
              />
            </div>
            <div className="mt-4">
              <BulletListEditor
                label="Highlights"
                items={item.highlights}
                onChange={(highlights) => updateItem(item.id, { highlights })}
              />
            </div>
          </ItemCard>
        ))}
        <Button variant="secondary" className="w-full" onClick={addItem}>
          + Add education
        </Button>
      </div>
    </Card>
  );
}
