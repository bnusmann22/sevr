import type { AuditEntry } from "../../types";
import { Upload, Eye, Edit3, Download, Share2, ShieldAlert, Clock, Activity } from "lucide-react";

function getActionIcon(action: AuditEntry["action"]) {
  switch (action) {
    case "upload":
      return <Upload className="w-3 h-3 text-emerald-600" />;
    case "view":
      return <Eye className="w-3 h-3 text-blue-600" />;
    case "edit":
      return <Edit3 className="w-3 h-3 text-indigo-600" />;
    case "export":
      return <Download className="w-3 h-3 text-amber-600" />;
    case "share":
      return <Share2 className="w-3 h-3 text-purple-600" />;
    case "alert":
    case "access_revoked":
      return <ShieldAlert className="w-3 h-3 text-rose-600" />;
    default:
      return <Activity className="w-3 h-3 text-slate-500" />;
  }
}

export default function AuditEntryRow({ entry }: { entry: AuditEntry }) {
  const isTampered = entry.id === "audit_2";
  return (
    <tr className="border-b border-slate-200 text-xs hover:bg-slate-50/50 transition">
      <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        {entry.timestamp}
      </td>
      <td className="py-3 px-4 font-medium text-slate-900">{entry.actor}</td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono font-semibold text-[11px] border border-slate-200">
          {getActionIcon(entry.action)}
          {entry.action}
        </span>
      </td>
      <td className="py-3 px-4 text-slate-700"><p>{entry.detail}</p><p className={`mt-1 text-[10px] font-semibold ${isTampered ? "text-rose-700" : "text-emerald-700"}`}>{isTampered ? "TAMPERED DEMO ENTRY" : "VERIFIED HASH CHAIN"}</p></td>
    </tr>
  );
}
