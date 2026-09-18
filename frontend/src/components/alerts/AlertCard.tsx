import { AlertTriangle, User, Check, ShieldAlert, Clock } from "lucide-react";

export interface DetectionAlertItem {
  id: string;
  detectorName: string;
  targetUser: string;
  riskScore: number;
  evidenceSummary: string;
  status: "open" | "acknowledged" | "dismissed" | "escalated";
  createdAt: string;
}

export default function AlertCard({ alert, onStatusChange }: { alert: DetectionAlertItem; onStatusChange: (id: string, status: DetectionAlertItem["status"]) => void }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs hover:shadow-md transition flex flex-col justify-between gap-3">
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            {alert.detectorName}
          </span>
          <h4 className="font-semibold text-sm text-slate-900 mt-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Target User: <span className="text-slate-800 font-bold">{alert.targetUser}</span>
          </h4>
        </div>
        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          Score: {alert.riskScore}/100
        </span>
      </div>

      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 font-mono leading-relaxed">
        {alert.evidenceSummary}
      </p>

      <div className="flex justify-between items-center text-xs pt-1">
        <span className="text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {alert.createdAt}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => onStatusChange(alert.id, "acknowledged")} className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1 text-xs">
            <Check className="w-3.5 h-3.5 text-slate-500" />
            Acknowledge
          </button>
          <button type="button" onClick={() => onStatusChange(alert.id, "escalated")} className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition flex items-center gap-1 text-xs shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            Escalate
          </button>
          <button type="button" onClick={() => onStatusChange(alert.id, "dismissed")} className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900">Dismiss</button>
        </div>
      </div>
    </div>
  );
}
