import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type ItemCardProps = {
  title: string;
  subtitle?: string;
  onRemove: () => void;
  children: ReactNode;
};

export function ItemCard({ title, subtitle, onRemove, children }: ItemCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <Button
          variant="ghost"
          className="shrink-0 px-2 py-1 text-xs text-red-600"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
      {children}
    </article>
  );
}
