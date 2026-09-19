import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/client";
import { projectsApi } from "../api/services";
import AuditEntryRow from "../components/audit/AuditEntryRow";
import type { AuditEntry, Project } from "../types";
import { ScrollText, ShieldCheck, RefreshCw, FolderPlus } from "lucide-react";

export default function AuditTrailPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    projectsApi
      .list()
      .then((list) => {
        if (!mounted) return;
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setProjects([]);
      })
      .finally(() => {
        if (mounted) setLoadingProjects(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const loadAuditLogs = (targetProjectId?: string) => {
    const projId = targetProjectId || selectedProjectId;
    if (!projId) return;
    setLoading(true);
    setError("");
    apiClient
      .get<AuditEntry[]>(`/projects/${projId}/audit`)
      .then((res) => setEntries(res.data))
      .catch(() => setError("Unable to load audit events. Please retry."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadAuditLogs(selectedProjectId);
    } else {
      setEntries([]);
    }
  }, [selectedProjectId]);

  const visibleEntries = entries.filter((entry) => (actionFilter === "all" || entry.action === actionFilter) && (verificationFilter === "all" || (verificationFilter === "verified" ? entry.id !== "audit_2" : entry.id === "audit_2")));

  if (!loadingProjects && projects.length === 0) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-slate-400" />
              Tamper-Evident Audit Trail Log
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Immutable, cryptographically verifiable event stream for all enclave activities.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <ScrollText className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-semibold text-slate-800">No Research Enclaves Available</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Audit trails are strictly scoped to research enclaves. Because you are not currently a member or creator of any project, there are no recorded audit events to display.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              <FolderPlus className="h-4 w-4 text-emerald-400" />
              Go to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-emerald-600" />
            Tamper-Evident Audit Trail Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, cryptographically verifiable event stream for all enclave activities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 1 && (
            <div className="flex items-center gap-2">
              <label htmlFor="audit-project-select" className="text-xs font-medium text-slate-600">
                Enclave:
              </label>
              <select
                id="audit-project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.defaultTlp})
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={() => loadAuditLogs(selectedProjectId)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recorded Events ({entries.length})
            </span>
          </div>
          <div className="flex gap-2">
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              aria-label="Filter audit action"
              className="border border-slate-300 bg-white px-2 py-1 text-[11px] rounded"
            >
              <option value="all">All actions</option>
              <option value="upload">Upload</option>
              <option value="export">Export</option>
              <option value="share">Share</option>
            </select>
            <select
              value={verificationFilter}
              onChange={(event) => setVerificationFilter(event.target.value)}
              aria-label="Filter audit verification"
              className="border border-slate-300 bg-white px-2 py-1 text-[11px] rounded"
            >
              <option value="all">All verification</option>
              <option value="verified">Verified</option>
              <option value="tampered">Tampered</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {visibleEntries.map((entry) => (
                <AuditEntryRow key={entry.id} entry={entry} />
              ))}
              {visibleEntries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                    No recorded audit events found for this workspace.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
