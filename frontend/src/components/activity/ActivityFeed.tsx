import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Activity } from "lucide-react";

type ActivityEvent = { id: string; type: string; actor: string; detail: string; time: string };

export default function ActivityFeed({ projectId }: { projectId: string }) {
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiClient.get<ActivityEvent[]>(`/projects/${projectId}/activity`).then((response) => setEvents(response.data)).catch(() => setError("Unable to load project activity.")).finally(() => setLoading(false));
  }, [projectId]);

  const filtered = filter === "all" ? events : events.filter((event) => event.type === filter);
  return <section aria-label="Project activity" className="space-y-4"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Activity className="h-4 w-4 text-emerald-600" />Recent activity</h2><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter activity by type" className="border border-slate-300 px-2 py-1 text-xs"><option value="all">All events</option><option value="upload">Uploads</option><option value="view">Views</option><option value="share">Shares</option></select></div>{loading && <p role="status" className="text-sm text-slate-500">Loading activity...</p>}{error && <p role="alert" className="border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}{!loading && !error && filtered.length === 0 ? <p className="border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No activity matches this filter.</p> : <div className="divide-y divide-slate-200 border border-slate-200 bg-white">{filtered.map((event) => <div key={event.id} className="flex items-start justify-between gap-4 p-4"><div><p className="text-sm text-slate-800"><span className="font-semibold">{event.actor}</span> {event.detail}</p><p className="mt-1 text-xs text-slate-500">{event.type}</p></div><time className="whitespace-nowrap text-xs text-slate-400">{event.time}</time></div>)}</div>}</section>;
}