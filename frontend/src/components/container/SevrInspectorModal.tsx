import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Clock,
  User,
  Upload,
  X,
  Loader2,
  Lock,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { sevrInspectorApi, type SevrVerificationResult } from "../../api/services";

interface SevrInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SevrInspectorModal({ isOpen, onClose }: SevrInspectorModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<SevrVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      verifyContainer(selected);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      verifyContainer(selected);
    }
  };

  const verifyContainer = async (targetFile: File) => {
    setVerifying(true);
    setError(null);
    setResult(null);
    try {
      const res = await sevrInspectorApi.verifyContainer(targetFile);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to parse and verify .sevr container format.");
    } finally {
      setVerifying(false);
    }
  };

  const metadata = result?.header?.metadata;
  const watermark = result?.header?.watermark;
  const statusInfo = result?.header?.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                .sevr Container Inspector &amp; Verifier
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Cryptographic Ed25519 signature &amp; time-bound clearance manifest tool
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Dropzone area */}
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              file
                ? "border-emerald-400 bg-emerald-50/40"
                : "border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-slate-50"
            }`}
          >
            <input type="file" onChange={handleFileSelect} className="hidden" accept=".sevr" />
            <Upload className="w-8 h-8 text-emerald-600" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">
                {file ? file.name : "Drop any .sevr container package here, or click to browse"}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports binary .sevr cryptographic files"}
              </p>
            </div>
          </label>

          {/* Loading indicator */}
          {verifying && (
            <div className="p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-600">
                Parsing magic header, verifying Ed25519 signature &amp; auditing clearance time-lock…
              </p>
            </div>
          )}

          {/* Error alert */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Verification Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Verification Results Breakdown */}
          {result && (
            <div className="space-y-5 border-t border-slate-200 pt-4">
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  result.valid && !result.expired
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : result.expired
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.valid && !result.expired ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  ) : result.expired ? (
                    <Clock className="w-7 h-7 text-amber-600" />
                  ) : (
                    <ShieldAlert className="w-7 h-7 text-rose-600" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight font-mono">
                      {result.valid && !result.expired
                        ? "AUTHENTIC & ACTIVE CONTAINER"
                        : result.expired
                        ? "TIME-BOUND CLEARANCE EXPIRED"
                        : "INVALID / TAMPERED CONTAINER"}
                    </h4>
                    <p className="text-xs opacity-90">
                      {result.valid && !result.expired
                        ? "Ed25519 signature verified. Container payload encrypted & unexpired."
                        : result.expired
                        ? "Time-bound clearance period has elapsed. Payload is unreadable."
                        : "Cryptographic signature or container header integrity check failed."}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/80 border border-current shadow-xs">
                  {result.status.toUpperCase()}
                </span>
              </div>

              {/* Header Metadata Summary */}
              {metadata && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Asset Name</span>
                    <p className="font-bold text-slate-800 truncate">{metadata.name || "Unknown"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Format / TLP</span>
                    <p className="font-bold text-slate-800 font-mono">
                      .{metadata.original_format || metadata.format} · TLP:{metadata.tlp}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 col-span-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Time-Bound Clearance Period
                    </span>
                    <div className="flex items-center justify-between text-slate-700 font-mono text-[11px] pt-0.5">
                      <span>Created: {metadata.created_at?.slice(0, 19).replace("T", " ")}</span>
                      <span>Expires: {metadata.expires_at?.slice(0, 19).replace("T", " ")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Watermark Attribution Manifest */}
              {watermark && (
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 text-xs font-mono border border-slate-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Recipient Attribution Manifest
                    </span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-bold">
                      {watermark.watermarkId || "SEVR-STAMP"}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <p>
                      <span className="text-slate-500">Target Recipient:</span> {watermark.recipient || metadata?.recipient || "N/A"}
                    </p>
                    <p>
                      <span className="text-slate-500">Issuer Enclave:</span> {metadata?.institution || "SeVR Varsity Enclave"}
                    </p>
                    <p>
                      <span className="text-slate-500">Payload SHA-256:</span> {watermark.checksum || metadata?.checksum || "Verified"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
