import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FolderPlus, Users, Search, RefreshCw, AlertCircle, Shield, Folder } from "lucide-react";
import { projectsApi } from "../api/services";
import type { Project, TLPLabel } from "../types";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import { readAuthSession } from "./LoginPage";

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tlpFilter, setTlpFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const session = readAuthSession();
  const canCreate = ["supervisor", "institution_admin"].includes(session?.role ?? "");

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await projectsApi.list();
      setProjects(data);
    } catch {
      setError("Unable to connect to enclave storage. Please verify the API connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const addProject = async (name: string, description: string, defaultTlp: TLPLabel) => {
    setCreating(true);
    try {
      const newProj = await projectsApi.create({ name, description, defaultTlp });
      setProjects((current) => [...current, newProj]);
      setCreateOpen(false);
      window.dispatchEvent(new CustomEvent("sevr:projects-changed"));
    } catch {
      setError("Unable to create enclave. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesTlp = tlpFilter === "all" || p.defaultTlp === tlpFilter;
      return matchesSearch && matchesTlp;
    });
  }, [projects, search, tlpFilter]);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Authenticated Research Enclave
            </span>
            {session && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                {session.role}
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Research Enclaves &amp; Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Select an isolated research vault or provision a new enclave under institutional policy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadProjects}
            className="flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {canCreate ? (
            <button
              id="create-project-btn"
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              <FolderPlus className="h-4 w-4 text-emerald-400" />
              Create Project
            </button>
          ) : (
            <button
              type="button"
              disabled
              title="Supervisor or Institution Admin role required to provision new enclaves"
              className="flex cursor-not-allowed items-center gap-2 bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-500"
            >
              <FolderPlus className="h-4 w-4" />
              Create (Supervisor only)
            </button>
          )}
        </div>
      </div>

      {/* Controls: Search and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title or description..."
            className="w-full border border-slate-300 py-1.5 pl-8 pr-3 text-xs focus:border-emerald-600 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="tlp-filter" className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-slate-400" />
            Filter TLP:
          </label>
          <select
            id="tlp-filter"
            value={tlpFilter}
            onChange={(e) => setTlpFilter(e.target.value)}
            className="border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
          >
            <option value="all">All Classifications</option>
            <option value="CLEAR">TLP:CLEAR</option>
            <option value="GREEN">TLP:GREEN</option>
            <option value="AMBER">TLP:AMBER</option>
            <option value="RED">TLP:RED</option>
          </select>
        </div>
      </div>

      {/* Error state with Retry */}
      {error && (
        <div role="alert" className="flex items-center justify-between border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadProjects}
            className="font-semibold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse border border-slate-200 bg-white p-5 space-y-3">
              <div className="h-5 w-3/4 bg-slate-200" />
              <div className="h-4 w-full bg-slate-100" />
              <div className="h-4 w-1/2 bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="border border-dashed border-slate-300 bg-white p-12 text-center">
          <Folder className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-800">
            {search || tlpFilter !== "all" ? "No matching enclaves found" : "No research enclaves yet"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {search || tlpFilter !== "all"
              ? "Try adjusting your search criteria or resetting filters."
              : "Provision your first isolated enclave to begin managing secure varsity datasets under FIRST TLP 2.0 governance."}
          </p>
          {canCreate && !search && tlpFilter === "all" && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-2 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              Create your first project
            </button>
          )}
        </div>
      )}

      {/* Project Grid */}
      {!loading && !error && filteredProjects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-500 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {project.name}
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-slate-600 line-clamp-2">
                    {project.description ?? "No description provided."}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    project.defaultTlp === "RED"
                      ? "bg-rose-100 text-rose-800"
                      : project.defaultTlp === "AMBER"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  TLP:{project.defaultTlp ?? "AMBER"}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>{project.memberCount} members</span>
                  <span className="mx-1">·</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">ID: {project.id}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={createOpen}
        isSubmitting={creating}
        onClose={() => setCreateOpen(false)}
        onCreated={addProject}
      />
    </div>
  );
}