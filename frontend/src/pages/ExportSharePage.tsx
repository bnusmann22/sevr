import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import type { ExportDecision, SevrFile } from "../types";
import ExportOutcomeBanner from "../components/sharing/ExportOutcomeBanner";
import ShareDialog from "../components/sharing/ShareDialog";
import { Share2, Download, FileText } from "lucide-react";

const FILE_ID = "file_1"; // AMBER-labelled; try file_2 for RED hard floor

export default function ExportSharePage() {
  const [selectedFileId, setSelectedFileId] = useState(FILE_ID);
  const [overrideRequested, setOverrideRequested] = useState(false);
  const [decision, setDecision] = useState<ExportDecision | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<SevrFile[]>([]);
  useEffect(() => { apiClient.get<SevrFile[]>("/projects/proj_1/files").then((response) => { setFiles(response.data); if (response.data[0]) setSelectedFileId(response.data[0].id); }).catch(() => setError("Unable to load workspace files.")); }, []);

  async function requestExport() {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post<ExportDecision>(`/files/${selectedFileId}/export`, { overrideRequested });
      setDecision(res.data);
    } catch {
      setError("Export evaluation failed. Please verify the file policy and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-600" />
          Export &amp; Share Decision Gateway
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Evaluates export request rules against TLP classifications and enforces forced <code className="font-mono text-emerald-600 font-bold">.sevr</code> container encryption.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Select Test File Asset
          </label>
          <select
            value={selectedFileId}
            onChange={(e) => {
              setSelectedFileId(e.target.value);
              setDecision(null);
            }}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
          >
            {files.map((file) => <option key={file.id} value={file.id}>{file.name} (TLP:{file.tlpLabel})</option>)}
          </select>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <label className="flex items-start gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={overrideRequested}
              onChange={(e) => setOverrideRequested(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="font-semibold text-slate-900">Request Supervisor Override</span>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Allows native export for AMBER if approved by PI. Ignored for RED-classified files (PRD Section 5.1).
              </p>
            </div>
          </label>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={requestExport}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            {loading ? "Evaluating Rule Engine..." : "Evaluate Export Rules"}
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-2"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            Share External Link
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {decision && (
          <div className="pt-2">
            <ExportOutcomeBanner decision={decision} />
          </div>
        )}
      </div>

      <ShareDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
}
