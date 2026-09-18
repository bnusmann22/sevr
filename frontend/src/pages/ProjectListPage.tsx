import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderPlus, Users } from "lucide-react";
import { apiClient } from "../api/client";
import type { Project, TLPLabel } from "../types";
import CreateProjectModal from "../components/projects/CreateProjectModal";

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  useEffect(() => { apiClient.get<Project[]>("/projects").then((response) => setProjects(response.data)).catch(() => setError("Unable to load projects.")).finally(() => setLoading(false)); }, []);
  const addProject = (name: string, description: string, defaultTlp: TLPLabel) => {
    const project: Project = { id: `proj_${projects.length + 1}`, name, description, defaultTlp, memberCount: 1, createdAt: new Date().toISOString() };
    setProjects((current) => [...current, project]); setCreateOpen(false);
  };
  return <div className="max-w-5xl space-y-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Authenticated workspace</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Projects</h1><p className="mt-1 text-sm text-slate-500">Choose a research enclave to continue.</p></div><button type="button" onClick={() => setCreateOpen(true)} className="flex items-center gap-2 bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"><FolderPlus className="h-4 w-4" />Create project</button></div>
    {loading && <p className="text-sm text-slate-500">Loading projects...</p>}{error && <p role="alert" className="border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{!loading && !error && projects.length === 0 && <p className="border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No projects yet.</p>}
    <div className="grid gap-4 md:grid-cols-2">{projects.map((project) => <Link key={project.id} to={`/projects/${project.id}`} className="border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900">{project.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{project.description ?? "No description provided."}</p></div><span className="text-xs font-bold text-emerald-700">TLP:{project.defaultTlp ?? "AMBER"}</span></div><div className="mt-5 flex items-center gap-1 text-xs text-slate-500"><Users className="h-3.5 w-3.5" />{project.memberCount} members <span className="mx-1">·</span>{new Date(project.createdAt).toLocaleDateString()}</div></Link>)}</div>
    <CreateProjectModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={addProject} />
  </div>;
}