import { useState } from "react";
import { History, GitCommit, ArrowUpRight, Upload, X } from "lucide-react";
import type { FileVersion } from "../../types";

interface Props {
  versions: FileVersion[];
  currentVersionNumber?: string;
  onUploadNewVersion?: (file: File, summary: string) => Promise<void>;
  onSelectVersion?: (version: FileVersion) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionHistoryDrawer({
  versions,
  currentVersionNumber = "1.0",
  onUploadNewVersion,
  onSelectVersion,
  isOpen,
  onClose,
}: Props) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [changeSummary, setChangeSummary] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload || !onUploadNewVersion || uploading) return;

    setUploading(true);
    try {
      await onUploadNewVersion(fileToUpload, changeSummary);
      setFileToUpload(null);
      setChangeSummary("");
      setShowUploadForm(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <History className="h-5 w-5 text-emerald-600" />
            Version Lineage &amp; Revision Tree
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload New Version Button */}
        {onUploadNewVersion && !showUploadForm && (
          <button
            type="button"
            onClick={() => setShowUploadForm(true)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-600 bg-emerald-50/50 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100/50"
          >
            <Upload className="h-4 w-4" />
            Ingest New Document Version (v{(parseFloat(currentVersionNumber) + 1.0).toFixed(1)})
          </button>
        )}

        {/* Inline Version Upload Form */}
        {showUploadForm && (
          <form onSubmit={handleUploadSubmit} className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 text-xs">
            <h4 className="mb-2 font-bold text-emerald-900">Ingest Revised Document Artifact</h4>
            
            <input
              type="file"
              onChange={(e) => setFileToUpload(e.target.files?.[0] ?? null)}
              className="mb-2 block w-full text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-emerald-600 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-700"
            />

            <input
              type="text"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Revision notes (e.g. Added section 3 methodology updates)..."
              className="mb-3 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:border-emerald-600 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!fileToUpload || uploading}
                className="rounded-lg bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Upload Version
              </button>
            </div>
          </form>
        )}

        {/* Version Tree Timeline */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {versions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No version history records found.
            </div>
          ) : (
            versions.map((ver) => {
              const isCurrent = ver.versionNumber === currentVersionNumber;

              return (
                <div
                  key={ver.id}
                  className={`relative rounded-xl border p-3.5 transition ${
                    isCurrent
                      ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-slate-900">
                      <GitCommit className="h-4 w-4 text-emerald-600" />
                      Version {ver.versionNumber}
                      {isCurrent && (
                        <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                          Current
                        </span>
                      )}
                    </span>

                    {onSelectVersion && !isCurrent && (
                      <button
                        type="button"
                        onClick={() => onSelectVersion(ver)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Inspect
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <p className="mt-1 text-xs font-mono text-slate-500 truncate" title={ver.checksumSha256}>
                    SHA-256: {ver.checksumSha256}
                  </p>

                  {ver.changeSummary && (
                    <p className="mt-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic">
                      "{ver.changeSummary}"
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                    <span>Uploaded by {ver.createdBy}</span>
                    <span>{new Date(ver.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
