import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Hash, ShieldCheck } from "lucide-react";
import { apiClient } from "../api/client";
import type { SevrFile } from "../types";
import TlpBadge from "../components/tlp/TlpBadge";

export default function FileDetailPage() {
  const { projectId = "", fileId = "" } = useParams();
  const [file, setFile] = useState<SevrFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    apiClient
      .get<SevrFile>(`/projects/${projectId}/files/${fileId}`)
      .then((response) => setFile(response.data))
      .catch(() => setError("Unable to load this file. Please return to the project and try again."))
      .finally(() => setLoading(false));
  }, [fileId, projectId]);

  if (loading) return <p role="status" className="text-sm text-slate-500">Loading file details...</p>;
  if (error || !file) return <div role="alert" className="space-y-4 border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"><p>{error || "File not found."}</p><Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 font-semibold underline"><ArrowLeft className="h-4 w-4" />Back to project</Link></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" />Back to project</Link>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-start gap-3"><div className="rounded-lg bg-slate-100 p-3 text-slate-700"><FileText className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">File detail</p><h1 className="mt-1 text-2xl font-bold text-slate-900">{file.name}</h1><p className="mt-1 text-sm text-slate-500">{file.originalFormat.toUpperCase()} · Version {file.versionCount}</p></div></div>
        <TlpBadge label={file.tlpLabel} />
      </header>
      <section className="grid gap-4 sm:grid-cols-2" aria-label="File metadata">
        <Metadata icon={<Calendar className="h-4 w-4" />} label="Uploaded" value={`${file.uploadedAt} by ${file.uploadedBy}`} />
        <Metadata icon={<Hash className="h-4 w-4" />} label="Checksum" value={file.checksumSha256 ?? "Demo checksum pending"} />
        <Metadata icon={<ShieldCheck className="h-4 w-4" />} label="Release policy" value={file.tlpLabel === "RED" ? "Container required; no override" : "Policy evaluation required"} />
        <Metadata icon={<FileText className="h-4 w-4" />} label="Source format" value={file.originalFormat.toUpperCase()} />
      </section>
      <section className="border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">Available actions</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">Release actions must pass through preview and release review before any share or download result.</p>
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled title="Preview workflow is part of Phase 3" className="cursor-not-allowed bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-500">Preview workflow next phase</button><Link to="/export" className="border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700">Evaluate export policy</Link></div>
      </section>
    </div>
  );
}

function Metadata({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="border border-slate-200 bg-white p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{icon}{label}</div><p className="mt-2 break-words text-sm text-slate-900">{value}</p></div>;
}
