import { Link, useLocation } from "react-router-dom";

const tabs = ["files", "activity", "members", "settings"] as const;
export type ProjectTab = typeof tabs[number];

export default function ProjectTabs({ projectId }: { projectId: string }) {
  const location = useLocation();
  const selected = (new URLSearchParams(location.search).get("tab") as ProjectTab | null) ?? "files";
  return <nav aria-label="Project sections" className="flex gap-1 border-b border-slate-200">
    {tabs.map((tab) => <Link key={tab} to={`/projects/${projectId}?tab=${tab}`} aria-current={selected === tab ? "page" : undefined} className={`border-b-2 px-3 py-2 text-xs font-semibold capitalize ${selected === tab ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}>{tab}</Link>)}
  </nav>;
}