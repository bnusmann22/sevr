import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { UploadCloud, X, AlertTriangle } from "lucide-react";

type UploadDropzoneProps = { onFileSelected?: (file: File | null) => void };

const DISALLOWED_EXTENSIONS = [
  "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico",
  "mp4", "avi", "mov", "wmv", "mp3", "wav", "exe", "dll", "zip", "rar", "tar", "gz"
];

export function isValidResearchFile(file: File): { valid: boolean; error?: string } {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type.toLowerCase();

  if (
    DISALLOWED_EXTENSIONS.includes(ext) ||
    mime.startsWith("image/") ||
    mime.startsWith("video/") ||
    mime.startsWith("audio/")
  ) {
    return {
      valid: false,
      error: `File type ".${ext.toUpperCase()}" is prohibited. Images (.jpg, .png) and media files are rejected. Only text-based research datasets, documents, and codebooks (CSV, PDF, DOCX, FASTA, TXT, JSON) are accepted.`
    };
  }
  return { valid: true };
}

export default function UploadDropzone({ onFileSelected }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);

  const selectFile = (nextFile: File | null) => {
    setFileTypeError(null);
    if (nextFile) {
      const validation = isValidResearchFile(nextFile);
      if (!validation.valid) {
        setFileTypeError(validation.error || "File type rejected.");
        setFile(null);
        onFileSelected?.(null);
        return;
      }
    }
    setFile(nextFile);
    onFileSelected?.(nextFile);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => selectFile(event.target.files?.[0] ?? null);
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files[0] ?? null);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition group ${
          dragging
            ? "border-emerald-600 bg-emerald-50"
            : fileTypeError
            ? "border-rose-300 bg-rose-50/50"
            : "border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-slate-100/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={handleInput}
          aria-label="Choose a research file"
          accept=".csv,.tsv,.txt,.json,.pdf,.doc,.docx,.fasta,.fastq,.md,.py,.r,.xml,.tab,.dat"
        />
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
        </div>
        <h3 className="font-semibold text-sm text-slate-800">
          {file ? file.name : "Drag & drop text research dataset or document"}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB · ${file.type || "Text/Document"}`
            : "Supports text-based research formats only (CSV, PDF, DOCX, FASTA, TXT, JSON). Images (JPG/PNG) & media are rejected."}
        </p>
        <div className="mt-4">
          <span className="inline-flex items-center gap-2 bg-white text-slate-700 text-xs px-3.5 py-1.5 rounded-lg border border-slate-200 font-medium shadow-xs group-hover:bg-slate-50">
            Browse Files
          </span>
          {file && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                selectFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              aria-label="Remove selected file"
              className="ml-2 inline-flex rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-rose-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {fileTypeError && (
        <div role="alert" className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg leading-relaxed">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{fileTypeError}</span>
        </div>
      )}
    </div>
  );
}
