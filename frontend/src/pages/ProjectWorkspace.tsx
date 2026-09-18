import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../api/client";
import FileList from "../components/files/FileList";
import UploadDropzone from "../components/files/UploadDropzone";
import type { Project, SevrFile } from "../types";
import { Folder, FileText, RefreshCw, Search } from "lucide-react";
import ProjectTabs from "../components/projects/ProjectTabs";
import ActivityFeed from "../components/activity/ActivityFeed";
import MemberList from "../components/projects/MemberList";
import ProjectSettings from "../components/projects/ProjectSettings";

export default function ProjectWorkspace() {
  const { projectId = "proj_1" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTab = new URLSearchParams(location.search).get("tab") ?? "files";
  const [files, setFiles] = useState<SevrFile[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tlpFilter, setTlpFilter] = useState("all");
  const visibleFiles = files.filter((file) => file.name.toLowerCase().includes(search.toLowerCase()) && (tlpFilter === "all" || file.tlpLabel === tlpFilter));

  const loadFiles = () => {
    setLoading(true);
    setError("");
    Promise.all([
      apiClient.get<Project>(`/projects/${projectId}`),
      apiClient.get<SevrFile[]>(`/projects/${projectId}/files`),
    ])
      .then(([projectResponse, filesResponse]) => {
        setProject(projectResponse.data);
        setFiles(filesResponse.data);
      })
      .catch(() => setError("Unable to load workspace files. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Folder className="w-5 h-5 text-emerald-600" />
            {project?.name ?? "Loading project..."}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {project?.description ?? "Loading project metadata..."} · ID: <span className="font-mono">{projectId}</span>
          </p>
        </div>
        <button
          onClick={loadFiles}
          className="px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <ProjectTabs projectId={projectId} />
      {selectedTab === "activity" && <ActivityFeed projectId={projectId} />}
      {selectedTab === "members" && <MemberList projectId={projectId} />}
      {selectedTab === "settings" && <ProjectSettings projectId={projectId} />}
      {selectedTab === "files" && <UploadDropzone onFileSelected={() => navigate("/upload")} />}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {loading && <p role="status" className="text-sm text-slate-500">Loading project files...</p>}
      {selectedTab === "files" && !loading && <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Enclave Research Files ({files.length})
          </h2>
          <div className="flex items-center gap-2"><label className="relative"><span className="sr-only">Search files</span><Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search files" className="w-32 border border-slate-300 py-1 pl-7 pr-2 text-[11px]" /></label><select value={tlpFilter} onChange={(event) => setTlpFilter(event.target.value)} aria-label="Filter files by TLP" className="border border-slate-300 bg-white px-2 py-1 text-[11px]"><option value="all">All TLP</option><option value="CLEAR">CLEAR</option><option value="GREEN">GREEN</option><option value="AMBER">AMBER</option><option value="RED">RED</option></select></div>
        </div>
        <FileList files={visibleFiles} />
      </div>}
    </div>
  );
}
