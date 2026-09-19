import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { filesApi, projectsApi } from "../api/services";
import type { Project, TLPLabel } from "../types";
import TlpSelector from "../components/tlp/TlpSelector";
import UploadDropzone from "../components/files/UploadDropzone";
import { Upload, Shield, Info, CheckCircle, AlertCircle, Folder, ArrowRight } from "lucide-react";
import { readAuthSession } from "./LoginPage";

export default function UploadPage() {
  const { projectId: routeProjectId } = useParams<{ projectId?: string }>();
  const [searchParams] = useSearchParams();
  const initialProjectId = routeProjectId || searchParams.get("projectId") || "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [label, setLabel] = useState<TLPLabel>("AMBER");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const session = readAuthSession();
  const canOverrideRed = ["supervisor", "institution_admin"].includes(session?.role ?? "");

  useEffect(() => {
    projectsApi.list().then((list) => {
      setProjects(list);
      if (!selectedProjectId && list.length > 0) {
        setSelectedProjectId(list[0].id);
      }
    });
  }, []);

  const ingestFile = async () => {
    if (!selectedFile || !selectedProjectId) return;
    setIsUploading(true);
    setIsUploaded(false);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("tlpLabel", label);

    try {
      const created = await filesApi.upload(selectedProjectId, formData);
      setIsUploaded(true);
      setUploadedFileId(created.id);
    } catch {
      setError("Unable to ingest this asset into the enclave. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-600" />
          Upload Research Asset
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ingest raw research datasets, codebooks, or documentation into a Zero-Trust enclave with mandatory TLP classification.
        </p>
      </div>

      {/* Target Project Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-emerald-600" />
          Target Research Enclave
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none font-medium"
        >
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.name} ({proj.id}) — Default TLP: {proj.defaultTlp ?? "AMBER"}
            </option>
          ))}
        </select>
      </div>

      {/* File Dropzone */}
      <UploadDropzone onFileSelected={setSelectedFile} />

      {/* Classification & Ingest Control */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Assign Traffic Light Protocol (TLP 2.0) Classification
          </label>
          <TlpSelector
            value={label}
            onChange={setLabel}
            canOverrideRed={canOverrideRed}
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            {label === "RED"
              ? "RED: Restrict to project members only. Native download or unencrypted sharing is permanently blocked."
              : label === "AMBER" || label === "AMBER_STRICT"
              ? "AMBER: External export requires mandatory .sevr cryptographic encapsulation unless supervisor override is logged."
              : "CLEAR / GREEN: Freely distributable or shareable within varsity partner community."}
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={ingestFile}
            disabled={!selectedFile || !selectedProjectId || isUploading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            {isUploading ? "Ingesting & Hashing..." : "Ingest & Classify Asset"}
          </button>
        </div>

        {isUploaded && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
            <div className="text-emerald-800 text-xs flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              File successfully ingested and cryptographically indexed with TLP:{label} classification.
            </div>
            <div className="flex gap-3 text-xs pt-1">
              <Link
                to={`/projects/${selectedProjectId}`}
                className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                Return to Enclave Files <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              {uploadedFileId && (
                <Link
                  to={`/projects/${selectedProjectId}/files/${uploadedFileId}`}
                  className="font-semibold text-slate-700 hover:underline"
                >
                  View File Detail
                </Link>
              )}
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
