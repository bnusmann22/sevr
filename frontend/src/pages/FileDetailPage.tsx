import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Hash,
  ShieldCheck,
  HardDrive,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Share2,
} from "lucide-react";
import { filesApi } from "../api/services";
import type { SevrFile } from "../types";
import TlpBadge from "../components/tlp/TlpBadge";

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function FileDetailPage() {
  const { projectId = "", fileId = "" } = useParams<{ projectId: string; fileId: string }>();
  const [file, setFile] = useState<SevrFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedChecksum, setCopiedChecksum] = useState(false);

  const loadFile = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await filesApi.get(projectId, fileId);
      setFile(data);
    } catch {
      setError("Unable to retrieve file metadata from enclave storage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFile();
  }, [projectId, fileId]);

  const copyChecksum = () => {
    if (!file?.checksumSha256) return;
    navigator.clipboard.writeText(file.checksumSha256);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="h-4 w-32 bg-slate-200 animate-pulse" />
        <div className="border border-slate-200 bg-white p-6 space-y-4 animate-pulse">
          <div className="h-6 w-1/2 bg-slate-200" />
          <div className="h-4 w-1/3 bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="max-w-xl mx-auto border border-rose-200 bg-rose-50 p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <h2 className="font-bold text-sm">Asset Metadata Unavailable</h2>
        </div>
        <p className="text-xs text-rose-600">
          {error || `The requested research file (${fileId}) could not be located inside enclave (${projectId}).`}
        </p>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={loadFile}
            className="flex items-center gap-1.5 border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
          <Link
            to={`/projects/${projectId}`}
            className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb back navigation */}
      <Link
        to={`/projects/${projectId}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to project workspace
      </Link>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Enclave Research Asset
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{file.name}</h1>
            <p className="mt-1 text-xs text-slate-500 font-mono">
              Format: <span className="font-bold uppercase text-slate-700">{file.originalFormat}</span> · Version {file.versionCount} · Enclave: {projectId}
            </p>
          </div>
        </div>
        <TlpBadge label={file.tlpLabel} />
      </header>

      {/* Metadata Grid */}
      <section className="grid gap-4 sm:grid-cols-2" aria-label="File metadata">
        <Metadata
          icon={<Calendar className="h-4 w-4" />}
          label="Ingested"
          value={`${new Date(file.uploadedAt).toLocaleDateString()} by ${file.uploadedBy}`}
        />
        <Metadata
          icon={<HardDrive className="h-4 w-4" />}
          label="Size on Disk"
          value={formatBytes(file.sizeBytes)}
        />
        <Metadata
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Release Policy"
          value={
            file.tlpLabel === "RED"
              ? "Container required; zero override permitted (Hard Floor)"
              : file.tlpLabel === "AMBER" || file.tlpLabel === "AMBER_STRICT"
              ? "Container required unless PI override approved"
              : "Native export permitted under general policy"
          }
        />
        <Metadata
          icon={<FileText className="h-4 w-4" />}
          label="Artifact Identifier"
          value={`file_id: ${file.id}`}
        />
      </section>

      {/* Checksum Card */}
      <section className="border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Hash className="h-4 w-4 text-emerald-600" />
            SHA-256 Cryptographic Checksum
          </div>
          <button
            type="button"
            onClick={copyChecksum}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {copiedChecksum ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="mt-2 font-mono text-xs text-slate-800 break-all bg-slate-50 p-2.5 rounded border border-slate-200">
          {file.checksumSha256 ?? "Pending cryptographic calculation"}
        </p>
      </section>

      {/* Actions */}
      <section className="border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Enclave Governance Actions</h2>
        <p className="text-xs leading-5 text-slate-500">
          Per Section 8 of the SeVR Implementation Specification, all files must undergo watermarking preview and release verification prior to signed link generation.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to={`/export?projectId=${projectId}&fileId=${file.id}`}
            className="flex items-center gap-1.5 bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-400" />
            Evaluate Export Policy
          </Link>
          <button
            type="button"
            disabled
            title="Preview and watermarking pipeline is delivered in Phase 3"
            className="cursor-not-allowed bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-400"
          >
            Watermark Preview (Phase 3)
          </button>
        </div>
      </section>
    </div>
  );
}

function Metadata({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 break-words text-sm text-slate-900 font-medium">{value}</p>
    </div>
  );
}
