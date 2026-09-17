import AlertCard, { DetectionAlertItem } from "./AlertCard";
import { ShieldCheck } from "lucide-react";

export default function AlertList({ alerts }: { alerts: DetectionAlertItem[] }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-500 text-sm">
        <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="font-semibold text-slate-800">All Clear</p>
        <p className="text-xs text-slate-500 mt-1">No anomaly detection alerts raised on this project workspace.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
