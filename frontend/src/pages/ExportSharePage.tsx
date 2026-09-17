import { useState } from "react";
import { apiClient } from "../api/client";
import type { ExportDecision } from "../types";
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

  async function requestExport() {
    setLoading(true);
    try {
      const res = await apiClient.post<ExportDecision>(`/files/${selectedFileId}/export`, { overrideRequested });
      setDecision(res.data);
    } catch (err) {
      console.error("Export request failed:", err);
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
            <option value="file_1">draft_manuscript_v3.docx (TLP:AMBER)</option>
            <option value="file_2">raw_samples_2026.csv (TLP:RED - Mandatory Hard Floor)</option>
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
