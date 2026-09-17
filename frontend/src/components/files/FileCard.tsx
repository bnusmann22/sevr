import type { SevrFile } from "../../types";
import TlpBadge from "../tlp/TlpBadge";
import { FileText, Share2 } from "lucide-react";

export default function FileCard({ file }: { file: SevrFile }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs hover:shadow-md transition flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
          <FileText className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-slate-900">{file.name}</h4>
          <p className="text-xs text-slate-500">
            Uploaded by {file.uploadedBy} · {file.originalFormat?.toUpperCase()} · v{file.versionCount}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <TlpBadge label={file.tlpLabel} />
        <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline">
          <Share2 className="w-3.5 h-3.5" />
          Export / Share
        </button>
      </div>
    </div>
  );
}
