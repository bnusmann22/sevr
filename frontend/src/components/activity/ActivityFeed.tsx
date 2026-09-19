import { useEffect, useState } from "react";
import { activityApi, type ActivityEvent } from "../../api/services";
import { Activity, AlertCircle, RefreshCw } from "lucide-react";

export default function ActivityFeed({ projectId }: { projectId: string }) {
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivity = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await activityApi.list(projectId);
      setEvents(data);
    } catch {
      setError("Unable to retrieve enclave activity log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [projectId]);

  const filtered =
    filter === "all" ? events : events.filter((event) => event.type === filter);

  return (
    <section aria-label="Project activity" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Activity className="h-4 w-4 text-emerald-600" />
          Real-Time Audit &amp; Event Stream
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter activity by type"
            className="border border-slate-300 bg-white px-2 py-1 text-xs focus:border-emerald-600 focus:outline-none"
          >
            <option value="all">All Events</option>
            <option value="upload">Uploads</option>
            <option value="view">Views</option>
            <option value="share">Shares</option>
            <option value="settings">Settings</option>
            <option value="member">Membership</option>
            <option value="create">Creation</option>
          </select>
          <button
            type="button"
            onClick={loadActivity}
            className="flex items-center gap-1 border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-12 bg-slate-100 rounded" />
          <div className="h-12 bg-slate-100 rounded" />
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center justify-between border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadActivity}
            className="font-semibold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
          {filtered.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200">
              <p className="text-xs text-slate-500">No events match the selected activity filter.</p>
            </div>
          ) : (
            filtered.map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="text-xs text-slate-800">
                    <span className="font-semibold text-slate-900">{event.actor}</span>{" "}
                    {event.detail}
                  </p>
                  <span className="mt-1 inline-block text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    {event.type}
                  </span>
                </div>
                <time className="whitespace-nowrap text-[11px] text-slate-400 font-mono">
                  {event.time}
                </time>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}