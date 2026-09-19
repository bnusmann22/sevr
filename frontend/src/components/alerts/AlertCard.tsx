import { useState } from "react";
import { AlertTriangle, User, Check, ShieldAlert, Clock, XCircle, Loader2, CheckCircle2 } from "lucide-react";

export interface DetectionAlertItem {
  id: string;
  detectorName: string;
  targetUser: string;
  riskScore: number;
  evidenceSummary: string;
  status: "open" | "acknowledged" | "dismissed" | "escalated" | "approved";
  createdAt: string;
}

export default function AlertCard({
  alert,
  onStatusChange,
}: {
  alert: DetectionAlertItem;
  onStatusChange: (id: string, status: DetectionAlertItem["status"]) => Promise<void> | void;
}) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleAction = async (newStatus: DetectionAlertItem["status"]) => {
    if (alert.status === newStatus || updating) return;
    setUpdating(newStatus);
    try {
      await onStatusChange(alert.id, newStatus);
    } finally {
      setUpdating(null);
    }
  };

  const statusBadge = () => {
    switch (alert.status) {
      case "acknowledged":
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1"><Check className="w-3 h-3" /> ACKNOWLEDGED</span>;
      case "escalated":
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> ESCALATED</span>;
      case "dismissed":
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1"><XCircle className="w-3 h-3" /> DISMISSED</span>;
      case "approved":
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> APPROVED</span>;
      default:
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> OPEN</span>;
    }
  };

  const getContainerStyle = () => {
    switch (alert.status) {
      case "acknowledged":
        return "border-blue-300 bg-blue-50/30";
      case "escalated":
        return "border-rose-300 bg-rose-50/40";
      case "dismissed":
        return "border-slate-300 bg-slate-50/80 opacity-75";
      case "approved":
        return "border-emerald-300 bg-emerald-50/30";
      default:
        return "border-slate-200 bg-white hover:border-slate-300";
    }
  };

  return (
    <div className={`border rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 ${getContainerStyle()}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              {alert.detectorName}
            </span>
            {statusBadge()}
          </div>
          <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-1.5 pt-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Target User: <span className="text-slate-800 font-bold">{alert.targetUser}</span>
          </h4>
        </div>
        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          Score: {alert.riskScore}/100
        </span>
      </div>

      <p className="text-xs text-slate-700 bg-slate-50/90 p-2.5 rounded-lg border border-slate-200/80 font-mono leading-relaxed">
        {alert.evidenceSummary}
      </p>

      <div className="flex justify-between items-center text-xs pt-1">
        <span className="text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {alert.createdAt}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!!updating}
            onClick={() => handleAction("acknowledged")}
            className={`px-3 py-1.5 rounded-lg border transition-all duration-150 flex items-center gap-1.5 text-xs font-semibold ${
              alert.status === "acknowledged"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {updating === "acknowledged" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {alert.status === "acknowledged" ? "Acknowledged" : "Acknowledge"}
          </button>
          <button
            type="button"
            disabled={!!updating}
            onClick={() => handleAction("escalated")}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 text-xs font-semibold shadow-xs ${
              alert.status === "escalated"
                ? "bg-rose-700 text-white shadow-sm ring-2 ring-rose-400"
                : "bg-rose-600 text-white hover:bg-rose-700"
            }`}
          >
            {updating === "escalated" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            {alert.status === "escalated" ? "Escalated" : "Escalate"}
          </button>
          <button
            type="button"
            disabled={!!updating}
            onClick={() => handleAction("dismissed")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-150 flex items-center gap-1.5 font-semibold ${
              alert.status === "dismissed"
                ? "bg-slate-700 text-white border border-slate-700 shadow-sm"
                : "border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {updating === "dismissed" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            {alert.status === "dismissed" ? "Dismissed" : "Dismiss"}
          </button>
        </div>
      </div>
    </div>
  );
}
