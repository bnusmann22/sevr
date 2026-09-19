import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { filesApi, projectsApi } from "../api/services";
import type { ExportDecision, Project, SevrFile } from "../types";
import ExportOutcomeBanner from "../components/sharing/ExportOutcomeBanner";
import ShareDialog from "../components/sharing/ShareDialog";
import { Share2, Download, FileText, Folder, AlertCircle, ArrowLeft, RefreshCw, Eye, ShieldAlert } from "lucide-react";
import { readAuthSession } from "./LoginPage";

export default function ExportSharePage() {
  const { projectId: routeProjectId, fileId: routeFileId } = useParams<{ projectId?: string; fileId?: string }>();
  const [searchParams] = useSearchParams();
  const urlProjectId = routeProjectId || searchParams.get("projectId") || "";
  const urlFileId = routeFileId || searchParams.get("fileId") || "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId);
  const [files, setFiles] = useState<SevrFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState(urlFileId);
  const [overrideRequested, setOverrideRequested] = useState(false);
  const [decision, setDecision] = useState<ExportDecision | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  const session = readAuthSession();
  const isSupervisor = ["supervisor", "institution_admin"].includes(session?.role ?? "");

  // Load projects list
  useEffect(() => {
    projectsApi
      .list()
      .then((list) => {
        setProjects(list);
        if (list.length > 0) {
          const targetProjId = urlProjectId && list.some((p) => p.id === urlProjectId)
            ? urlProjectId
            : list[0].id;
          setSelectedProjectId(targetProjId);
        }
      })
      .catch(() => setError("Unable to load enclaves."))
      .finally(() => setLoadingProjects(false));
  }, [urlProjectId]);

  // Load files whenever selected project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    setLoadingFiles(true);
    setDecision(null);
    filesApi
      .list(selectedProjectId)
      .then((data) => {
        setFiles(data);
        if (data.length > 0) {
          const targetFile = urlFileId && data.some((f) => f.id === urlFileId)
            ? urlFileId
            : data[0].id;
          setSelectedFileId(targetFile);
        } else {
          setSelectedFileId("");
        }
      })
      .catch(() => setError("Unable to load project files."))
      .finally(() => setLoadingFiles(false));
  }, [selectedProjectId, urlFileId]);

  async function requestExport() {
    if (!selectedFileId) return;
    setEvaluating(true);
    setError("");
    try {
      const res = await filesApi.evaluateExport(selectedFileId, overrideRequested);
      setDecision(res);
    } catch {
      setError("Export evaluation failed. Please verify the file policy and try again.");
    } finally {
      setEvaluating(false);
    }
  }

  const handleOpenShare = () => {
    if (!selectedFileId) return;
    const isInspected = sessionStorage.getItem(`sevr_preview_confirmed_${selectedFileId}`) === "true";
    if (!isInspected) {
      setError("Mandatory Preview Gate: Institutional governance requires visual inspection and recipient watermarking before generating external share links. Please complete Mandatory Preview first.");
      return;
    }
    setIsShareOpen(true);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-600" />
          Export &amp; Share Policy Gateway
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Evaluates egress requests against FIRST TLP 2.0 classifications and determines whether native format, forced <code className="font-mono text-emerald-600 font-bold">.sevr</code> container encapsulation, or complete export blocking applies.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
        {/* Project Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-slate-500" />
            1. Select Research Enclave
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setDecision(null);
            }}
            disabled={loadingProjects}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium bg-white"
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name} ({proj.id})
              </option>
            ))}
          </select>
        </div>

        {/* File Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              2. Select Target Research Asset
            </label>
            {selectedProjectId && (
              <Link
                to={`/projects/${selectedProjectId}`}
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                View workspace
              </Link>
            )}
          </div>

          {loadingFiles ? (
            <p className="text-xs text-slate-500 py-2">Loading enclave assets...</p>
          ) : files.length === 0 ? (
            <div className="p-4 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No files exist in this project enclave.{" "}
              <Link to={`/upload?projectId=${selectedProjectId}`} className="text-emerald-700 font-semibold underline">
                Upload a file first
              </Link>
            </div>
          ) : (
            <select
              value={selectedFileId}
              onChange={(e) => {
                setSelectedFileId(e.target.value);
                setDecision(null);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium bg-white"
            >
              {files.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.name} (TLP:{file.tlpLabel}) · v{file.versionCount}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Supervisor Override Option */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <label className="flex items-start gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={overrideRequested}
              onChange={(e) => {
                setOverrideRequested(e.target.checked);
                setDecision(null);
              }}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="font-semibold text-slate-900">Request Supervisor / PI Policy Override</span>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Permits native export for AMBER files when formal supervisor review is documented. Has no effect on RED files (TLP:RED has zero override capability under SeVR charter).
              </p>
              {!isSupervisor && (
                <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                  * Note: Current role is Researcher. Final release will be queued for Supervisor authorization.
                </span>
              )}
            </div>
          </label>
        </div>

        {/* Evaluation Controls */}
        <div className="flex flex-wrap gap-3 pt-1">
          {selectedProjectId && selectedFileId && (
            <Link
              to={`/projects/${selectedProjectId}/files/${selectedFileId}/preview`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 shadow-xs"
            >
              <Eye className="w-4 h-4 text-emerald-100" />
              <span>Mandatory Preview &amp; Watermark</span>
            </Link>
          )}

          <button
            onClick={requestExport}
            disabled={evaluating || !selectedFileId}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            {evaluating ? "Evaluating Rule Engine..." : "Evaluate Export Rules"}
          </button>

          <button
            onClick={handleOpenShare}
            disabled={!selectedFileId}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-2"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            Share External Link
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
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
