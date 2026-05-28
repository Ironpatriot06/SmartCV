"use client";

import { Button } from "@/components/ui/Button";

type TailorPreviewBannerProps = {
  viewingOriginal: boolean;
  onToggleView: () => void;
  onApply: () => void;
  onDiscard: () => void;
};

export function TailorPreviewBanner({
  viewingOriginal,
  onToggleView,
  onApply,
  onDiscard,
}: TailorPreviewBannerProps) {
  return (
    <div
      role="status"
      className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-900">
            Tailored preview ready
          </p>
          <p className="mt-0.5 text-xs text-indigo-700">
            {viewingOriginal
              ? "Showing your original resume. Switch to compare AI suggestions."
              : "Showing AI-tailored content. Your original is preserved until you apply."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={onToggleView}>
            {viewingOriginal ? "View tailored" : "View original"}
          </Button>
          <Button variant="ghost" onClick={onDiscard}>
            Discard
          </Button>
          <Button onClick={onApply}>Apply changes</Button>
        </div>
      </div>
    </div>
  );
}
