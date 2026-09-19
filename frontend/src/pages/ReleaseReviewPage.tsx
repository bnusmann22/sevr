import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Download,
  Share2,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  FileText,
} from "lucide-react";
import { projectsApi, filesApi } from "../api/services";
import { apiClient } from "../api/client";
import type { Project, SevrFile, ExportDecision } from "../types";

import TlpBadge from "../components/tlp/TlpBadge";
import type { WatermarkConfig } from "../components/preview/SafePreviewRenderer";
import { readAuthSession } from "./LoginPage";

export default function ReleaseReviewPage() {
  const { projectId, fileId } = useParams<{ projectId: string; fileId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [file, setFile] = useState<SevrFile | null>(null);
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig | null>(null);
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null);

  const [overrideRequested, setOverrideRequested] = useState(false);
  const [decision, setDecision] = useState<ExportDecision | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scoped Share Link Generation State
  const [shareLinkExpiry, setShareLinkExpiry] = useState<"24h" | "48h" | "7d">("24h");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);


  const session = readAuthSession();
  const isSupervisor = ["supervisor", "institution_admin", "system_admin"].includes(session?.role ?? "");

  useEffect(() => {
    if (!fileId) return;
    const confirmed = sessionStorage.getItem(`sevr_preview_confirmed_${fileId}`) === "true";
    setIsConfirmed(confirmed);

    const savedConfigStr = sessionStorage.getItem(`sevr_watermark_config_${fileId}`);
    if (savedConfigStr) {
      try {
        setWatermarkConfig(JSON.parse(savedConfigStr));
      } catch (e) {
        console.error("Failed to parse watermark config", e);
      }
    }
  }, [fileId]);

  useEffect(() => {
    async function loadData() {
      if (!projectId || !fileId || isConfirmed === false) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [projData, fileData] = await Promise.all([
          projectsApi.get(projectId),
          filesApi.get(projectId, fileId),
        ]);
        setProject(projData);
        setFile(fileData);

        // Initial export rule evaluation
        setEvaluating(true);
        const evalDecision = await filesApi.evaluateExport(fileId, overrideRequested);
        setDecision(evalDecision);
      } catch (err) {
        console.error("Failed to load release review data", err);
        setError("Unable to evaluate file release policy.");
      } finally {
        setLoading(false);
        setEvaluating(false);
      }
    }

    if (isConfirmed === true) {
      loadData();
    }
  }, [projectId, fileId, isConfirmed, overrideRequested]);

  const handleReevaluate = async (overrideVal: boolean) => {
    if (!fileId) return;
    setEvaluating(true);
    setError(null);
    try {
      const evalDecision = await filesApi.evaluateExport(fileId, overrideVal);
      setDecision(evalDecision);
    } catch {
      setError("Re-evaluation of release policy failed.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!file || !project) return;
    setError(null);
    setGeneratingLink(true);
    try {
      const hours = shareLinkExpiry === "24h" ? 24 : shareLinkExpiry === "48h" ? 48 : 168;
      const artifactType = decision?.outcome === "sevr_container" ? "sevr_container" : "native";
      const recipientEmail = watermarkConfig?.recipient || session?.email || "researcher@bayero.edu.ng";

      const res = await apiClient.post("/share/create", {
        fileId: file.id,
        projectId: project.id,
        recipientEmail,
        artifactType,
        expiresInHours: hours,
      });

      const fullUrl = `${window.location.origin}${res.data.shareUrl}`;
      setGeneratedLink(fullUrl);
    } catch (err: any) {
      console.error("Failed to generate share link:", err);
      setError(err.response?.data?.detail || "Failed to generate scoped share link.");
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyShareLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadPackage = async () => {
    if (!file || !project) return;
    setDownloading(true);
    setError(null);
    try {
      const artifactType = decision?.outcome === "sevr_container" ? "sevr_container" : "native";
      const recipientEmail = watermarkConfig?.recipient || session?.email || "researcher@bayero.edu.ng";

      const res = await apiClient.post("/share/create", {
        fileId: file.id,
        projectId: project.id,
        recipientEmail,
        artifactType,
        expiresInHours: 24,
      });

      const downloadToken = res.data.token;
      const downloadRes = await apiClient.get(`/share/${downloadToken}/download`, {
        responseType: "blob",
      });

      const contentDisposition = downloadRes.headers["content-disposition"];
      let filename = file.name;
      if (artifactType === "sevr_container" && !filename.endsWith(".sevr")) {
        filename = `${filename}.sevr`;
      }
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blobUrl = window.URL.createObjectURL(new Blob([downloadRes.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err: any) {
      console.error("Failed to download release package:", err);
      setError(err.response?.data?.detail || "Failed to generate and download release package.");
    } finally {
      setDownloading(false);
    }
  };


  // -------------------------------------------------------------------------
  // FLOW GUARD: Uninspected Access Blocked
  // -------------------------------------------------------------------------
  if (isConfirmed === false) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-amber-200 shadow-md text-center space-y-5">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Mandatory Preview Gate Required
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Release Evaluation Blocked by Enclave Policy
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Institutional zero-trust governance mandates that all research assets undergo sandboxed visual inspection and recipient watermark parameterization before export authorization or link generation.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-left text-xs text-slate-700 space-y-2">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            Egress Compliance Checklist:
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 font-mono text-[11px]">
            <li>Sandboxed visual inspection of file contents</li>
            <li>Accredited institutional recipient stamping (*.edu or *.edu.ng)</li>
            <li>Sign-off on FIRST TLP 2.0 attribution constraints</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/files/${fileId}/preview`)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Complete Mandatory Preview Inspection</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition"
          >
            Return to Project
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Verifying Policy Clearance &amp; FIRST TLP 2.0 Rules…</p>
      </div>
    );
  }

  if (error || !project || !file) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-xl border border-rose-200 shadow-sm text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Release Review Inaccessible</h2>
        <p className="text-sm text-slate-600">{error || "Asset or project parameters could not be resolved."}</p>
        <button
          type="button"
          onClick={() => navigate(`/projects/${projectId}/files/${fileId}/preview`)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Preview Inspection</span>
        </button>
      </div>
    );
  }

  const isBlocked = decision?.outcome === "blocked";
  const isContainer = decision?.outcome === "sevr_container";
  const isNative = decision?.outcome === "native";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
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
          <Link to={`/projects/${project.id}/files/${file.id}/preview`} className="hover:text-emerald-700 font-medium text-slate-700 transition">
            Preview
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            Release Governance Review
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Final Release Clearance &amp; Egress Gate
              </h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Inspection Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Asset has been certified through sandboxed preview. Evaluate FIRST TLP 2.0 distribution decision.
            </p>
          </div>

          <Link
            to={`/projects/${project.id}/files/${file.id}/preview`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modify Watermark Parameters</span>
          </Link>
        </div>
      </div>

      {/* Decision Summary Card */}
      <div
        className={`p-6 rounded-xl border shadow-xs space-y-4 ${
          isBlocked
            ? "bg-rose-50/50 border-rose-200"
            : isContainer
            ? "bg-amber-50/40 border-amber-200"
            : "bg-emerald-50/40 border-emerald-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                isBlocked
                  ? "bg-rose-100 text-rose-700"
                  : isContainer
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isBlocked ? (
                <ShieldAlert className="w-6 h-6" />
              ) : isContainer ? (
                <Lock className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {isBlocked
                    ? "Egress Prohibited by FIRST TLP 2.0 Charter"
                    : isContainer
                    ? "Mandatory Encapsulated .sevr Container Release"
                    : "Unencapsulated Native Release Approved"}
                </h2>
                <TlpBadge label={file.tlpLabel} />
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{decision?.reason}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Clearance Outcome
            </span>
            <span
              className={`font-mono text-xs font-bold uppercase px-2 py-0.5 rounded inline-block mt-0.5 ${
                isBlocked
                  ? "bg-rose-100 text-rose-800"
                  : isContainer
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {decision?.outcome}
            </span>
          </div>
        </div>

        {/* Certified Watermark Dossier Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/80 p-3.5 rounded-lg border border-slate-200/60 font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Certified Recipient</span>
            <span className="font-semibold text-slate-800 truncate block mt-0.5">
              {watermarkConfig?.recipient || "Not Configured"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Stamp Identifier</span>
            <span className="font-semibold text-emerald-700 block mt-0.5">
              {watermarkConfig?.watermarkId || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Placement &amp; Opacity</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {watermarkConfig?.placement} ({watermarkConfig?.opacity}%)
            </span>
          </div>
        </div>

        {/* Supervisor Policy Override Option */}
        <div className="p-4 bg-white rounded-lg border border-slate-200/80 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={overrideRequested}
              onChange={(e) => {
                const nextVal = e.target.checked;
                setOverrideRequested(nextVal);
                handleReevaluate(nextVal);
              }}
              disabled={file.tlpLabel === "RED" || evaluating}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-30"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900">Request Supervisor / PI Policy Override</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {file.tlpLabel === "RED"
                  ? "TLP:RED has a mandatory zero-override policy under the SeVR Security Charter."
                  : "Permits unencapsulated native export when formal review is documented and signed by the enclave PI."}
              </p>
              {!isSupervisor && file.tlpLabel !== "RED" && (
                <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                  * Note: As a Researcher, this override request will be queued for PI confirmation.
                </span>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Action Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Release Package Download */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Audited Package Download</h3>
              <p className="text-[11px] text-slate-500">Download cryptographically sealed research payload</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {isBlocked
              ? "Download is strictly blocked under current TLP constraints."
              : isContainer
              ? "Asset will be bundled inside a zero-trust .sevr container including cryptographic manifest, recipient stamp, and audit trail."
              : "Asset will be exported in native format with verified SHA-256 checksum and digital provenance header."}
          </p>

          <button
            type="button"
            onClick={handleDownloadPackage}
            disabled={isBlocked || downloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              {downloading
                ? "Generating & Packaging Asset..."
                : isContainer
                ? "Download Sealed .sevr Container"
                : "Download Verified Native Asset"}
            </span>
          </button>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Package generated successfully with recipient audit imprint!</span>
            </div>
          )}
        </div>

        {/* Scoped External Link Generation */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scoped Expiry Share Link</h3>
              <p className="text-[11px] text-slate-500">Generate time-limited URL bound to recipient identity</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Link Expiration Window
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["24h", "48h", "7d"] as const).map((window) => (
                  <button
                    key={window}
                    type="button"
                    onClick={() => setShareLinkExpiry(window)}
                    disabled={isBlocked || generatingLink}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      shareLinkExpiry === window
                        ? "bg-teal-50 border-teal-500 text-teal-800"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {window === "24h" ? "24 Hours" : window === "48h" ? "48 Hours" : "7 Days"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateShareLink}
              disabled={isBlocked || generatingLink}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
            >
              {generatingLink ? (
                <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 text-teal-600" />
              )}
              <span>{generatingLink ? "Generating Token Link..." : "Generate Scoped Share Link"}</span>
            </button>


            {generatedLink && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 px-2.5 py-1.5 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1 shrink-0"
                  >
                    {copiedLink ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Access will automatically terminate after {shareLinkExpiry}. Audit entry recorded.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
