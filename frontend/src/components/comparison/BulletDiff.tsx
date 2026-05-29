"use client";

type BulletDiffProps = {
  before?: string;
  after?: string;
};

function normalize(value: string | undefined) {
  return (value ?? "").trim();
}

export function BulletDiff({ before, after }: BulletDiffProps) {
  const oldValue = normalize(before);
  const newValue = normalize(after);
  const type =
    oldValue && newValue && oldValue !== newValue
      ? "modified"
      : oldValue && !newValue
        ? "removed"
        : !oldValue && newValue
          ? "added"
          : "unchanged";

  const classes = {
    added: "border-emerald-200 bg-emerald-50",
    removed: "border-red-200 bg-red-50",
    modified: "border-amber-200 bg-amber-50",
    unchanged: "border-slate-200 bg-white",
  };

  return (
    <div className={`rounded-md border p-3 ${classes[type]}`}>
      {oldValue && (
        <p className={type === "removed" ? "text-sm text-red-800" : "text-sm text-slate-600"}>
          <span className="font-medium">Before:</span> {oldValue}
        </p>
      )}
      {newValue && oldValue !== newValue && (
        <p className="mt-1 text-sm text-slate-900">
          <span className="font-medium">After:</span> {newValue}
        </p>
      )}
      {oldValue === newValue && oldValue && (
        <p className="text-sm text-slate-600">{oldValue}</p>
      )}
    </div>
  );
}
