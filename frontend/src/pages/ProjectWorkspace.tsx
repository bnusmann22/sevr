import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import FileList from "../components/files/FileList";
import UploadDropzone from "../components/files/UploadDropzone";
import type { SevrFile } from "../types";
import { Folder, FileText, RefreshCw } from "lucide-react";

const PROJECT_ID = "proj_1";

export default function ProjectWorkspace() {
  const [files, setFiles] = useState<SevrFile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = () => {
    setLoading(true);
    apiClient
      .get<SevrFile[]>(`/projects/${PROJECT_ID}/files`)
      .then((res) => setFiles(res.data))
      .catch((err) => console.error("Error loading files:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Folder className="w-5 h-5 text-emerald-600" />
            Rural Groundwater Contamination Study
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Project Enclave Workspace · ID: <span className="font-mono">{PROJECT_ID}</span>
          </p>
        </div>
        <button
          onClick={loadFiles}
          className="px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <UploadDropzone />

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Enclave Research Files ({files.length})
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Zero-Trust Protected
          </span>
        </div>
        <FileList files={files} />
      </div>
    </div>
  );
}
