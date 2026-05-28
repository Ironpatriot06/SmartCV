import { Button } from "@/components/ui/Button";
import { inputClassName, labelClassName } from "./styles";

type BulletListEditorProps = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
};

export function BulletListEditor({
  label,
  items,
  onChange,
  placeholder = "Add a bullet point…",
}: BulletListEditorProps) {
  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => onChange([...items, ""]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className={labelClassName}>{label}</span>
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={addItem}>
          + Add bullet
        </Button>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="pt-2 text-slate-400">•</span>
            <input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className={inputClassName}
            />
            <Button
              variant="ghost"
              className="shrink-0 px-2 py-1 text-xs text-red-600"
              onClick={() => removeItem(index)}
              aria-label="Remove bullet"
            >
              Remove
            </Button>
          </li>
        ))}
        {items.length === 0 && (
          <li>
            <Button variant="secondary" className="w-full" onClick={addItem}>
              Add first bullet
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
}
