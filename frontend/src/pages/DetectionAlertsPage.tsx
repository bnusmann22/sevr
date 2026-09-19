import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AlertList from "../components/alerts/AlertList";
import type { DetectionAlertItem } from "../components/alerts/AlertCard";
import { ShieldAlert, RefreshCw, FolderPlus } from "lucide-react";
import { projectsApi } from "../api/services";
import type { Project } from "../types";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [alerts, setAlerts] = useState<DetectionAlertItem[]>(INITIAL_ALERTS);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    projectsApi
      .list()
      .then((list) => {
        if (mounted) setProjects(list);
      })
      .catch(() => {
        if (mounted) setProjects([]);
      })
      .finally(() => {
        if (mounted) setLoadingProjects(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const visibleAlerts = filter === "all" ? alerts : alerts.filter((alert) => filter === "high" ? alert.riskScore >= 80 : alert.status === filter);

  if (!loadingProjects && projects.length === 0) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-400" />
              Zero-Trust Anomaly Detection Queue
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time automated policy violation and threat detection alerts across enclave workspaces.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <ShieldAlert className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-semibold text-slate-800">No Research Enclaves Assigned</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            The Zero-Trust Anomaly Detection Queue monitors threat events across active research enclaves. Because you are not currently a member or creator of any project, there are no anomaly alerts to display.
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
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Zero-Trust Anomaly Detection Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated policy violation and threat detection alerts across enclave workspaces.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter alerts"
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-rose-500 focus:outline-none"
          >
            <option value="all">All alerts</option>
            <option value="open">Open</option>
            <option value="high">High risk</option>
          </select>
          <button
            type="button"
            onClick={() => setAlerts(INITIAL_ALERTS)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <AlertList alerts={visibleAlerts} onStatusChange={(id, status) => setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, status } : alert))} />
    </div>
  );
}
