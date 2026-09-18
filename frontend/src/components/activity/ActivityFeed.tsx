import { useState } from "react";
import { Activity } from "lucide-react";

const events = [
  { id: "activity-1", type: "upload", actor: "Jamil", detail: "Uploaded draft_manuscript_v3.docx", time: "Aug 1, 2026" },
  { id: "activity-2", type: "view", actor: "Dr. Ada Okafor", detail: "Viewed the project workspace", time: "Jul 31, 2026" },
  { id: "activity-3", type: "share", actor: "Jamil", detail: "Shared a review link", time: "Jul 30, 2026" },
];

export default function ActivityFeed() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? events : events.filter((event) => event.type === filter);
  return <section aria-label="Project activity" className="space-y-4"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Activity className="h-4 w-4 text-emerald-600" />Recent activity</h2><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter activity by type" className="border border-slate-300 px-2 py-1 text-xs"><option value="all">All events</option><option value="upload">Uploads</option><option value="view">Views</option><option value="share">Shares</option></select></div>{filtered.length === 0 ? <p className="border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No activity matches this filter.</p> : <div className="divide-y divide-slate-200 border border-slate-200 bg-white">{filtered.map((event) => <div key={event.id} className="flex items-start justify-between gap-4 p-4"><div><p className="text-sm text-slate-800"><span className="font-semibold">{event.actor}</span> {event.detail}</p><p className="mt-1 text-xs text-slate-500">{event.type}</p></div><time className="whitespace-nowrap text-xs text-slate-400">{event.time}</time></div>)}</div>}</section>;
}