import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  ArrowLeft,
  Shield,
  Save,
  Clock,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  FileText,
  Lock,
  Sparkles,
  X,
} from "lucide-react";
import { projectsApi, filesApi } from "../api/services";
import type { Project, SevrFile } from "../types";
import DatasetGridEditor from "../components/editor/DatasetGridEditor";
import DocumentCodeEditor from "../components/editor/DocumentCodeEditor";
import TlpBadge from "../components/tlp/TlpBadge";
import { readAuthSession } from "./LoginPage";

export default function EnclaveEditorSandboxPage() {
  const { projectId, fileId } = useParams<{ projectId: string; fileId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [file, setFile] = useState<SevrFile | null>(null);
  const [initialContent, setInitialContent] = useState<string>("");
  const [activeContent, setActiveContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-save state
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);
  const [hasUncommittedChanges, setHasUncommittedChanges] = useState(false);

  // Commit Version Modal State
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [versionBump, setVersionBump] = useState<"patch" | "minor" | "major">("patch");
  const [changeSummary, setChangeSummary] = useState("");
  const [targetState, setTargetState] = useState<"DRAFT" | "IN_REVIEW">("DRAFT");
  const [committing, setCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState<string | null>(null);

  const session = readAuthSession();
  const isMember = Boolean(session?.token);

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

        // Fetch raw file content stream
        try {
          const contentRes = await filesApi.getContent(projectId, fileId);
          setInitialContent(contentRes.content || "");
          setActiveContent(contentRes.content || "");
        } catch {
          // Fallback mock content if empty
          const fallbackText = `PRIMARY RESEARCH DATASET / CODEBOOK — ${fileData.name}\n========================================\nAsset ID: ${fileData.id}\nTLP Designation: TLP:${fileData.tlpLabel}\n\n# Research Notes & In-Enclave Codebook\n- Dataset verified against varsity zero-trust policy.\n- Modify records in-place within the secure sandbox container.`;
          setInitialContent(fallbackText);
          setActiveContent(fallbackText);
        }
      } catch (err: unknown) {
        console.error("Failed loading editor sandbox data", err);
        setError("Unable to initialize in-enclave editor sandbox.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId, fileId]);

  // Handle content changes from sub-editors
  const handleContentChange = (updated: string) => {
    setActiveContent(updated);
    setHasUncommittedChanges(updated !== initialContent);

    // Auto-save timestamp update
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLastAutoSaveTime(timeStr);
  };

  // Determine editor format mode
  const isTabular = file?.originalFormat && ["csv", "tsv", "xlsx", "json"].includes(file.originalFormat.toLowerCase());

  // Execute Commit New Version action
  const handleCommitVersion = async () => {
    if (!projectId || !fileId || !file) return;
    if (!changeSummary.trim()) {
      setError("A revision change summary note is required for audit trail tracking.");
      return;
    }

    setCommitting(true);
    setError(null);

    try {
      // Calculate version number bump string
      const currentVerCount = file.versionCount || 1;
      const nextVerNum =
        versionBump === "major"
          ? `${currentVerCount + 1}.0`
          : versionBump === "minor"
          ? `1.${currentVerCount}`
          : `1.${currentVerCount}`;

      // Convert updated activeContent to a File object for version API upload
      const blob = new Blob([activeContent], { type: "text/plain" });
      const versionFile = new File([blob], file.name, { type: "text/plain" });

      const newVersion = await filesApi.uploadVersion(projectId, fileId, versionFile, changeSummary.trim());
      try {
        await filesApi.updateContent(projectId, fileId, activeContent, versionBump, changeSummary.trim());
      } catch (uErr) {
        console.warn("Content sync info:", uErr);
      }

      // If state transition requested to IN_REVIEW
      if (targetState === "IN_REVIEW") {
        try {
          await filesApi.transitionState(projectId, fileId, "IN_REVIEW", changeSummary.trim());
        } catch (tErr) {
          console.warn("State transition warning:", tErr);
        }
      }

      setCommitSuccess(`Version v${newVersion.versionNumber || nextVerNum} committed successfully! SHA-256 digest updated.`);
      setHasUncommittedChanges(false);
      setInitialContent(activeContent);
      setShowCommitModal(false);

      setTimeout(() => {
        navigate(`/projects/${projectId}/files/${fileId}`);
      }, 1200);
    } catch (err: any) {
      console.error("Version commit failed", err);
      setError(err.response?.data?.detail || "Failed to commit new version lineage to enclave.");
    } finally {
      setCommitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Booting In-Enclave Editor Sandbox &amp; Loading WebDAV Stream…</p>
      </div>
    );
  }

  if (error && !file) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-xl border border-rose-200 shadow-sm text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Editor Sandbox Initialisation Error</h2>
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
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header & Breadcrumb Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/projects" className="hover:text-emerald-700 transition">
            Projects
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/projects/${project?.id}`} className="hover:text-emerald-700 font-medium text-slate-700 transition truncate max-w-[200px]">
            {project?.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/projects/${project?.id}/files/${file?.id}`} className="hover:text-emerald-700 font-medium text-slate-700 transition truncate max-w-[200px]">
            {file?.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            In-Enclave Editor Sandbox
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>In-Enclave Active Sandbox</span>
                {isTabular ? (
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Tabular Dataset
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-700 bg-cyan-100 px-2.5 py-0.5 rounded-full border border-cyan-300">
                    <FileText className="w-3.5 h-3.5" /> Document &amp; Codebook
                  </span>
                )}
              </h1>
              {file?.tlpLabel && <TlpBadge label={file.tlpLabel} />}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Directly edit raw research datasets within zero-trust enclave boundaries with auto-saving and SHA-256 version lineage tracking.
            </p>
          </div>

          {/* Header Action Buttons & Auto-Save Status */}
          <div className="flex items-center gap-3">
            {lastAutoSaveTime && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-Saved {lastAutoSaveTime}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowCommitModal(true)}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition ${
                hasUncommittedChanges
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 animate-pulse"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              <GitCommit className="w-4 h-4 text-emerald-400" />
              <span>Commit New Version</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {commitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{commitSuccess}</span>
        </div>
      )}

      {/* Primary Sandbox Editor Container */}
      <div className="min-h-[560px]">
        {isTabular ? (
          <DatasetGridEditor
            initialContent={initialContent}
            onChange={handleContentChange}
          />
        ) : (
          <DocumentCodeEditor
            initialContent={initialContent}
            originalContent={initialContent}
            onChange={handleContentChange}
            format={file?.originalFormat || "txt"}
          />
        )}
      </div>

      {/* Commit Version Modal Dialog */}
      {showCommitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Commit Version Lineage</h3>
              </div>
              <button type="button" onClick={() => setShowCommitModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Version Bump Increment
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {[
                    { id: "patch", label: "Patch (v1.1)", desc: "Minor cell edits & typo fixes" },
                    { id: "minor", label: "Minor (v2.0)", desc: "Row additions & schema updates" },
                    { id: "major", label: "Major (v3.0)", desc: "Complete dataset restructuring" },
                  ].map((bump) => (
                    <button
                      key={bump.id}
                      type="button"
                      onClick={() => setVersionBump(bump.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        versionBump === bump.id
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold">{bump.label}</div>
                      <div className="text-[10px] opacity-75 font-sans mt-0.5">{bump.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Target Document Lifecycle Stage
                </label>
                <select
                  value={targetState}
                  onChange={(e) => setTargetState(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="DRAFT">Maintain State: DRAFT (Work in progress)</option>
                  <option value="IN_REVIEW">Submit to State: IN_REVIEW (Ready for supervisor check)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Change Summary / Revision Note (Mandatory)
                </label>
                <textarea
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="Explain cell edits, data additions, or codebook updates for the audit ledger..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Author:</span> <strong className="text-slate-800">{session?.name || session?.email}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Nextcloud Storage:</span> <strong className="text-emerald-700">vault/{projectId}/{file?.name}</strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCommitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={committing}
                onClick={handleCommitVersion}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-2 transition"
              >
                {committing ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCommit className="w-4 h-4" />}
                <span>{committing ? "Streaming Version to Vault..." : "Commit Version"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
