import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { projectsApi, filesApi } from "../api/services";
import FileList from "../components/files/FileList";
import UploadDropzone from "../components/files/UploadDropzone";
import type { Project, SevrFile } from "../types";
import {
  Folder,
  FileText,
  RefreshCw,
  Search,
  Upload,
  Share2,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";
import ProjectTabs from "../components/projects/ProjectTabs";
import ActivityFeed from "../components/activity/ActivityFeed";
import MemberList from "../components/projects/MemberList";
import ProjectSettings from "../components/projects/ProjectSettings";

export default function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTab = new URLSearchParams(location.search).get("tab") ?? "files";

  const [files, setFiles] = useState<SevrFile[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [tlpFilter, setTlpFilter] = useState("all");

  const loadWorkspace = async () => {
    if (!projectId) {
      navigate("/home", { replace: true });
      return;
    }

    setLoading(true);
    setError("");
    setNotFound(false);

    try {
      const [projData, filesData] = await Promise.all([
        projectsApi.get(projectId),
        filesApi.list(projectId),
      ]);
      setProject(projData);
      setFiles(filesData);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        setError("Unable to load workspace. Please check connectivity and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [projectId]);

  const visibleFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(search.toLowerCase()) &&
      (tlpFilter === "all" || file.tlpLabel === tlpFilter)
  );

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto border border-amber-200 bg-amber-50 p-8 rounded-xl text-center space-y-4">
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" />
        <h2 className="text-lg font-bold text-slate-900">Research Enclave Not Found</h2>
        <p className="text-xs text-slate-600">
          The requested project enclave <code className="font-mono font-semibold">{projectId}</code> does not exist, has been archived, or you lack authorization to inspect its contents.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={loadWorkspace}
            className="border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Retry lookup
          </button>
          <Link
            to="/home"
            className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/home" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Projects
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono text-emerald-700 font-semibold">{projectId}</span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-900 flex items-center gap-2">
            <Folder className="w-5 h-5 text-emerald-600 shrink-0" />
            {project?.name ?? (loading ? "Loading project..." : "Unknown Project")}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {project?.description ?? "Loading project metadata..."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadWorkspace}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 bg-white text-slate-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            to={`/upload?projectId=${projectId}`}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Asset
          </Link>
          <Link
            to={`/export?projectId=${projectId}`}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 hover:bg-slate-50 bg-white text-slate-700 flex items-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            Export &amp; Share
          </Link>
        </div>
      </div>

      {projectId && <ProjectTabs projectId={projectId} />}

      {/* Tabs */}
      {selectedTab === "activity" && projectId && <ActivityFeed projectId={projectId} />}
      {selectedTab === "members" && projectId && <MemberList projectId={projectId} />}
      {selectedTab === "settings" && projectId && (
        <ProjectSettings
          projectId={projectId}
          onProjectUpdated={(updatedProject) => setProject(updatedProject)}
        />
      )}

      {selectedTab === "files" && (
        <div className="space-y-6">
          <UploadDropzone onFileSelected={() => navigate(`/upload?projectId=${projectId}`)} />

          {error && (
            <div role="alert" className="flex items-center justify-between border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadWorkspace}
                className="font-semibold underline hover:text-rose-900"
              >
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="animate-pulse border border-slate-200 bg-white p-6 space-y-4">
              <div className="h-4 w-1/3 bg-slate-200" />
              <div className="h-10 w-full bg-slate-100" />
              <div className="h-10 w-full bg-slate-100" />
            </div>
          )}

          {!loading && (
            <div className="bg-white border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Enclave Research Files ({files.length})
                </h2>
                <div className="flex items-center gap-2">
                  <label className="relative">
                    <span className="sr-only">Search files</span>
                    <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search files..."
                      className="w-36 border border-slate-300 py-1 pl-7 pr-2 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </label>
                  <select
                    value={tlpFilter}
                    onChange={(e) => setTlpFilter(e.target.value)}
                    aria-label="Filter files by TLP"
                    className="border border-slate-300 bg-white px-2 py-1 text-xs focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="all">All TLP</option>
                    <option value="CLEAR">CLEAR</option>
                    <option value="GREEN">GREEN</option>
                    <option value="AMBER">AMBER</option>
                    <option value="RED">RED</option>
                  </select>
                </div>
              </div>

              {files.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">No assets have been ingested into this enclave yet.</p>
                  <Link
                    to={`/upload?projectId=${projectId}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload first dataset
                  </Link>
                </div>
              ) : visibleFiles.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500">No files match your search filter.</p>
              ) : (
                <FileList files={visibleFiles} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
