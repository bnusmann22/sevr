import { useState } from "react";
import AlertList from "../components/alerts/AlertList";
import type { DetectionAlertItem } from "../components/alerts/AlertCard";
import { ShieldAlert, RefreshCw } from "lucide-react";

const INITIAL_ALERTS: DetectionAlertItem[] = [
  {
    id: "alert_1",
    detectorName: "Anomalous Bulk Download",
    targetUser: "researcher_guest",
    riskScore: 88,
    evidenceSummary: "User attempted to download 45 RED/AMBER classified datasets in under 2 minutes across multiple subnets.",
    status: "open",
    createdAt: "2026-09-17 10:14:22",
  },
  {
    id: "alert_2",
    detectorName: "TLP Override Mismatch",
    targetUser: "external_collab_02",
    riskScore: 74,
    evidenceSummary: "Export request initiated without mandatory PI approval header for AMBER file (draft_manuscript_v3.docx).",
    status: "open",
    createdAt: "2026-09-17 09:30:00",
  },
];

export default function DetectionAlertsPage() {
  const [alerts, setAlerts] = useState<DetectionAlertItem[]>(INITIAL_ALERTS);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Zero-Trust Anomaly Detection Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated policy violation and threat detection alerts across enclave workspaces.
          </p>
        </div>
        <button
          onClick={() => setAlerts(INITIAL_ALERTS)}
          className="px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <AlertList alerts={alerts} />
    </div>
  );
}
