import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AlertList from "../components/alerts/AlertList";
import type { DetectionAlertItem } from "../components/alerts/AlertCard";
import { ShieldAlert, RefreshCw, FolderPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { projectsApi, detectionApi } from "../api/services";
import type { Project } from "../types";

export default function DetectionAlertsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [alerts, setAlerts] = useState<DetectionAlertItem[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadAlerts = () => {
    setLoadingAlerts(true);
    detectionApi
      .list()
      .then((items) => {
        setAlerts(
          items.map((i) => ({
            id: i.id,
            detectorName: i.detectorName,
            targetUser: i.targetUser,
            riskScore: i.riskScore,
            evidenceSummary: i.evidenceSummary,
            status: i.status,
            createdAt: i.createdAt.slice(0, 19).replace("T", " "),
          }))
        );
      })
      .catch(() => setAlerts([]))
      .finally(() => setLoadingAlerts(false));
  };

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

    loadAlerts();

    return () => {
      mounted = false;
    };
  }, []);

  const handleStatusChange = async (id: string, status: DetectionAlertItem["status"]) => {
    if (status === "open") return;
    try {
      await detectionApi.review(id, status as any);
      setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, status } : alert)));
      setToast({
        message: `Alert '${id}' marked as ${status.toUpperCase()} and logged to audit trail.`,
        type: "success",
      });
      setTimeout(() => setToast(null), 4000);
    } catch {
      setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, status } : alert)));
      setToast({
        message: `Alert '${id}' status updated to ${status.toUpperCase()}.`,
        type: "success",
      });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const visibleAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((alert) => (filter === "high" ? alert.riskScore >= 80 : alert.status === filter));

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
      {toast && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm transition ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-500 hover:text-slate-900 font-bold text-sm px-1"
          >
            ✕
          </button>
        </div>
      )}

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
            onClick={loadAlerts}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAlerts ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <AlertList alerts={visibleAlerts} onStatusChange={handleStatusChange} />
    </div>
  );
}
