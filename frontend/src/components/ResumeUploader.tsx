"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type ResumeUploaderProps = {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  filename: string | null;
};

export function ResumeUploader({
  onUpload,
  isUploading,
  filename,
}: ResumeUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    await onUpload(file);
  };

  return (
    <Card
      title="Upload resume"
      description="PDF only. We extract sections via your FastAPI backend."
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
          dragActive
            ? "border-indigo-400 bg-indigo-50/50"
            : "border-slate-200 bg-slate-50/30"
        }`}
      >
        <p className="text-sm font-medium text-slate-700">
          Drag & drop your PDF here
        </p>
        <p className="mt-1 text-xs text-slate-500">or choose a file</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <Button
          variant="secondary"
          className="mt-4"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? "Uploading…" : "Select PDF"}
        </Button>
        {filename && (
          <p className="mt-3 text-xs text-slate-500">
            Loaded: <span className="font-medium text-slate-700">{filename}</span>
          </p>
        )}
      </div>
    </Card>
  );
}
