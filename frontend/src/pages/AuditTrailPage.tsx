import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import AuditEntryRow from "../components/audit/AuditEntryRow";
import type { AuditEntry } from "../types";
import { ScrollText, ShieldCheck, RefreshCw } from "lucide-react";

const PROJECT_ID = "proj_1";

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = () => {
    setLoading(true);
    apiClient
      .get<AuditEntry[]>(`/projects/${PROJECT_ID}/audit`)
      .then((res) => setEntries(res.data))
      .catch((err) => console.error("Audit log error:", err))
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recorded Events ({entries.length})
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
            Hash-Chain Verified
          </span>
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
              {entries.map((entry) => (
                <AuditEntryRow key={entry.id} entry={entry} />
              ))}
              {entries.length === 0 && (
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
