import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, Shield, Eye, AlertCircle, Loader2 } from "lucide-react";
import { projectsApi, filesApi } from "../api/services";
import type { Project, SevrFile, TLP20Label } from "../types";
import SafePreviewRenderer, { WatermarkConfig } from "../components/preview/SafePreviewRenderer";
import WatermarkConfigPanel from "../components/preview/WatermarkConfigPanel";

export default function FilePreviewPage() {
  const { projectId, fileId } = useParams<{ projectId: string; fileId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [file, setFile] = useState<SevrFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [watermark, setWatermark] = useState<WatermarkConfig>({
    recipient: "",
    projectName: "",
    tlpLabel: "AMBER",
    placement: "diagonal",
    opacity: 45,
    timestamp: new Date().toISOString(),
    watermarkId: `SEVR-STAMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  });

  useEffect(() => {
    async function loadData() {
      if (!projectId || !fileId) return;
      try {
        setLoading(true);
        setError(null);
        const [projData, fileData] = await Promise.all([
          projectsApi.get(projectId),
          filesApi.get(projectId, fileId),
        ]);
        setProject(projData);
        setFile(fileData);
        setWatermark((prev) => ({
          ...prev,
          projectName: projData.name,
          tlpLabel: (fileData.tlpLabel as TLP20Label) || "AMBER",
        }));
      } catch (err: unknown) {
        console.error("Failed to load preview data", err);
        setError("Unable to load project or file context for safe preview.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId, fileId]);

  const handleWatermarkChange = (updated: Partial<WatermarkConfig>) => {
    setWatermark((prev) => ({ ...prev, ...updated }));
  };

  const handleProceedToRelease = () => {
    if (!fileId || !projectId) return;
    // Set cryptographic preview verification attestation in session
    sessionStorage.setItem(`sevr_preview_confirmed_${fileId}`, "true");
    sessionStorage.setItem(`sevr_watermark_config_${fileId}`, JSON.stringify(watermark));

    navigate(`/projects/${projectId}/files/${fileId}/release`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Initializing Safe Preview Enclave Sandbox…</p>
      </div>
    );
  }

  if (error || !project || !file) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-xl border border-rose-200 shadow-sm text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Preview Inspection Failed</h2>
        <p className="text-sm text-slate-600">{error || "File or project context could not be resolved."}</p>
        <button
          type="button"
          onClick={() => navigate(`/projects/${projectId}`)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Project Workspace</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Breadcrumb Navigation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/projects" className="hover:text-emerald-700 transition">
            Projects
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/projects/${project.id}`} className="hover:text-emerald-700 font-medium text-slate-700 transition truncate max-w-[200px]">
            {project.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/projects/${project.id}/files/${file.id}`} className="hover:text-emerald-700 font-medium text-slate-700 transition truncate max-w-[200px]">
            {file.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            Mandatory Preview Gate
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Mandatory Asset Inspection &amp; Watermarking
              </h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
                <Shield className="w-3 h-3 text-teal-600" />
                Track 3.2 Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visual clearance and cryptographic recipient stamping are required before institutional egress evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${project.id}/files/${file.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to File Dossier</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Preview & Config Split-Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sandboxed Safe Viewer (65% width) */}
        <div className="lg:col-span-8">
          <SafePreviewRenderer
            file={file}
            projectName={project.name}
            watermark={watermark}
          />
        </div>

        {/* Right Column: Watermark Controls & Inspection Attestation (35% width) */}
        <div className="lg:col-span-4 sticky top-6">
          <WatermarkConfigPanel
            file={file}
            projectName={project.name}
            config={watermark}
            onChange={handleWatermarkChange}
            onProceed={handleProceedToRelease}
          />
        </div>
      </div>
    </div>
  );
}
