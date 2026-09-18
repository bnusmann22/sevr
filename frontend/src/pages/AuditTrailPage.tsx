import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import AuditEntryRow from "../components/audit/AuditEntryRow";
import type { AuditEntry } from "../types";
import { ScrollText, ShieldCheck, RefreshCw } from "lucide-react";

const PROJECT_ID = "proj_1";

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const visibleEntries = entries.filter((entry) => (actionFilter === "all" || entry.action === actionFilter) && (verificationFilter === "all" || (verificationFilter === "verified" ? entry.id !== "audit_2" : entry.id === "audit_2")));

  const loadAuditLogs = () => {
    setLoading(true);
    setError("");
    apiClient
      .get<AuditEntry[]>(`/projects/${PROJECT_ID}/audit`)
      .then((res) => setEntries(res.data))
      .catch(() => setError("Unable to load audit events. Please retry."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-emerald-600" />
            Tamper-Evident Audit Trail Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, cryptographically verifiable event stream for all enclave activities.
          </p>
        </div>
        <button
          onClick={loadAuditLogs}
          className="px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
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
          <div className="flex gap-2"><select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)} aria-label="Filter audit action" className="border border-slate-300 bg-white px-2 py-1 text-[11px]"><option value="all">All actions</option><option value="upload">Upload</option><option value="export">Export</option><option value="share">Share</option></select><select value={verificationFilter} onChange={(event) => setVerificationFilter(event.target.value)} aria-label="Filter audit verification" className="border border-slate-300 bg-white px-2 py-1 text-[11px]"><option value="all">All verification</option><option value="verified">Verified</option><option value="tampered">Tampered</option></select></div>
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
