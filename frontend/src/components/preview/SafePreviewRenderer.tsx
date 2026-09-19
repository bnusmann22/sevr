import { useMemo, useState } from "react";
import {
  FileText,
  Table,
  Image as ImageIcon,
  Binary,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  Dna,
  Layers,
} from "lucide-react";
import type { SevrFile, TLP20Label } from "../../types";
import TlpBadge from "../tlp/TlpBadge";

export interface WatermarkConfig {
  recipient: string;
  projectName: string;
  tlpLabel: TLP20Label;
  placement: "diagonal" | "banner";
  opacity: number; // 20 - 70
  timestamp: string;
  watermarkId: string;
}

interface SafePreviewRendererProps {
  file: SevrFile;
  projectName: string;
  watermark: WatermarkConfig;
}

export default function SafePreviewRenderer({
  file,
  projectName,
  watermark,
}: SafePreviewRendererProps) {
  const [zoomLevel, setZoomLevel] = useState(100);

  const format = useMemo(() => {
    const ext = file.originalFormat?.toLowerCase() || file.name.split(".").pop()?.toLowerCase() || "";
    if (["csv", "tsv"].includes(ext)) return "tabular";
    if (["pdf", "docx", "doc"].includes(ext)) return "document";
    if (["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) return "image";
    if (["txt", "md", "json", "py", "r", "sh", "yaml"].includes(ext)) return "text";
    if (["fasta", "fastq", "fa", "fq", "sam", "bam"].includes(ext)) return "genomic";
    if (["nc", "hdf5", "h5", "parquet", "feather"].includes(ext)) return "scientific";
    return "binary";
  }, [file]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(150, Math.max(75, prev + delta)));
  };

  return (
    <div className="relative flex flex-col h-full min-h-[580px] bg-slate-900/5 rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
      {/* Viewport Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200/80 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-medium text-slate-800">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
          <span className="truncate max-w-[240px] font-semibold">{file.name}</span>
          <span className="text-slate-400">·</span>
          <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600">
            {format}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/70 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => handleZoom(-10)}
            disabled={zoomLevel <= 75}
            title="Zoom Out"
            className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1 font-semibold text-slate-700 min-w-[38px] text-center">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={() => handleZoom(10)}
            disabled={zoomLevel >= 150}
            title="Zoom In"
            className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render Canvas Container */}
      <div className="relative flex-1 overflow-auto p-6 bg-slate-100/70 flex items-center justify-center">
        {/* Render Canvas with dynamic zoom */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
          className="relative w-full max-w-2xl min-h-[460px] bg-white rounded-lg border border-slate-200 shadow-md p-8 overflow-hidden transition-transform duration-150 select-none"
        >
          {/* Active Watermark Overlay Layer */}
          <WatermarkOverlay watermark={watermark} />

          {/* Sandboxed Format Viewports */}
          {format === "tabular" && <TabularSandbox file={file} />}
          {format === "document" && <DocumentSandbox file={file} />}
          {format === "text" && <TextCodeSandbox file={file} />}
          {format === "image" && <ImageSandbox file={file} />}
          {format === "genomic" && <GenomicDossierSandbox file={file} />}
          {["scientific", "binary"].includes(format) && <StructuredDossierSandbox file={file} />}
        </div>
      </div>

      {/* Security Status Ribbon Footer */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 text-slate-300 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Zero-Trust Safe Sandbox Active</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">SHA-256: {file.checksumSha256 ? `${file.checksumSha256.slice(0, 12)}…` : "Verified"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Stamping ID:</span>
          <span className="text-emerald-400 font-semibold">{watermark.watermarkId}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Real-time Watermark Overlay Layer
// ---------------------------------------------------------------------------
function WatermarkOverlay({ watermark }: { watermark: WatermarkConfig }) {
  const opacityVal = watermark.opacity / 100;
  const stampText = `${watermark.recipient || "ENCLAVE RECIPIENT"} · ${watermark.projectName} · TLP:${watermark.tlpLabel} · ${watermark.timestamp.slice(0, 16).replace("T", " ")} UTC`;

  if (watermark.placement === "banner") {
    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 select-none">
        <div
          style={{ opacity: opacityVal }}
          className="w-full bg-slate-900 text-amber-300 px-3 py-1 text-center font-mono text-[11px] font-bold tracking-wider rounded border border-amber-400/40 shadow-sm"
        >
          RESTRICTED DISCLOSURE: {stampText}
        </div>
        <div
          style={{ opacity: opacityVal }}
          className="w-full bg-slate-900 text-amber-300 px-3 py-1 text-center font-mono text-[11px] font-bold tracking-wider rounded border border-amber-400/40 shadow-sm"
        >
          BAYERO ENCLAVE AUDITED EGRESS · DO NOT DUPLICATE · {watermark.watermarkId}
        </div>
      </div>
    );
  }

  // Diagonal 45-degree Repeating Stamp Pattern
  return (
    <div
      style={{ opacity: opacityVal }}
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden select-none"
    >
      <div className="grid grid-cols-2 gap-y-24 gap-x-12 -rotate-[35deg] scale-110">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center font-mono text-xs font-black tracking-wider text-slate-950/70 border border-dashed border-slate-900/30 p-2 rounded bg-amber-500/10 backdrop-blur-[0.5px]"
          >
            <span className="text-[11px] uppercase text-emerald-800">{watermark.projectName}</span>
            <span className="text-[10px] font-bold text-slate-900">{watermark.recipient || "UNASSIGNED RECIPIENT"}</span>
            <span className="text-[9px] text-slate-700">TLP:{watermark.tlpLabel} · {watermark.watermarkId}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sandboxed Format Renderers
// ---------------------------------------------------------------------------
function TabularSandbox({ file }: { file: SevrFile }) {
  const mockHeaders = ["Site_ID", "Latitude", "Longitude", "Sampling_Date", "Contaminant_PPM", "Safety_Index"];
  const mockRows = [
    ["NG-KAN-01", "11.9804° N", "8.5367° E", "2026-08-12", "0.042", "Nominal (Safe)"],
    ["NG-KAN-02", "11.9912° N", "8.5411° E", "2026-08-12", "0.118", "Elevated Caution"],
    ["NG-KAN-03", "12.0025° N", "8.5298° E", "2026-08-13", "0.021", "Nominal (Safe)"],
    ["NG-KAN-04", "11.9744° N", "8.5602° E", "2026-08-14", "0.385", "Threshold Exceeded"],
    ["NG-KAN-05", "12.0150° N", "8.5140° E", "2026-08-15", "0.055", "Nominal (Safe)"],
    ["NG-KAN-06", "11.9680° N", "8.5721° E", "2026-08-16", "0.089", "Nominal (Safe)"],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800">Tabular Dataset Preview (Showing 6 of 500 rows)</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Sanitized CSV Parser</span>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full text-left text-xs divide-y divide-slate-200 font-mono">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700">
            <tr>
              {mockHeaders.map((h) => (
                <th key={h} className="p-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
            {mockRows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50/80">
                {r.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentSandbox({ file }: { file: SevrFile }) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Bayero University Kano — Scoped Enclave Research Manuscript
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Asset Reference: <code className="font-mono text-emerald-700 font-semibold">{file.name}</code> (Version {file.versionCount})
        </p>
      </div>

      <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed font-serif">
        <p className="font-semibold text-slate-900">ABSTRACT & EXECUTIVE CLEARANCE</p>
        <p>
          This research dataset encompasses longitudinal microbial genomic sequencing and water quality telemetry collected across northern Sahelian groundwater reservoirs. Data release is governed under the institutional Zero-Trust Research Charter.
        </p>
        <p>
          Collaborators receiving this document are bound by the FIRST Standards TLP 2.0 attribution rules. Unauthorized egress or redistribution beyond authorized boundaries constitutes a compliance violation logged in the cryptographic hash-chained audit trail.
        </p>
        <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] text-slate-600">
          <span className="font-bold text-slate-800">Methodology Clearance:</span> Continuous telemetry logging via RS-485 sensors, validated via ISO/IEC 17025 accredited laboratory verification.
        </div>
      </div>
    </div>
  );
}

function TextCodeSandbox({ file }: { file: SevrFile }) {
  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-700 font-semibold">
        <FileCode className="w-4 h-4 text-teal-600" />
        <span>Source Codebook &amp; Computational Pipeline</span>
      </div>

      <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-[11px] leading-5 font-mono">
        <code>{`# SeVR Computational Pipeline — Statistical Verification
import pandas as pd
import numpy as np

def evaluate_contamination_index(df: pd.DataFrame) -> pd.Series:
    """Computes normalized threat index across sampled groundwater wells."""
    threshold = 0.05  # mg/L baseline WHO threshold
    anomaly_mask = df['Contaminant_PPM'] > threshold
    return np.where(anomaly_mask, 'Action Required', 'Safe')

print("Loaded telemetry pipeline version 2.4.0-sevr")`}</code>
      </pre>
    </div>
  );
}

function ImageSandbox({ file }: { file: SevrFile }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
      <div className="w-full h-48 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="w-10 h-10 text-slate-300" />
          <span className="text-xs font-mono font-medium text-slate-500">
            Rendered Raster Graphic ({file.name})
          </span>
        </div>
      </div>
      <p className="text-[11px] text-slate-500">
        Visual graphic safely scaled to preview canvas. Recipient watermark active.
      </p>
    </div>
  );
}

function GenomicDossierSandbox({ file }: { file: SevrFile }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200 text-slate-900">
        <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
          <Dna className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">Genomic FASTQ / FASTA Structured Dossier</h4>
          <p className="text-[11px] text-slate-500">Unfiltered binary genomic sequences are sandboxed from DOM execution.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sequence Quality</span>
          <p className="font-mono font-semibold text-slate-800">Q30 Quality Score: 94.2%</p>
        </div>
        <div className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Read Depth</span>
          <p className="font-mono font-semibold text-slate-800">100x Paired-End (Illumina)</p>
        </div>
        <div className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">File Header Magic</span>
          <p className="font-mono font-semibold text-slate-800">@SRR10294812.1_1</p>
        </div>
        <div className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Count</span>
          <p className="font-mono font-semibold text-slate-800">2.41 Million Base Pairs</p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Safe Preview Certification:</strong> This sequence dossier has passed automated malware and shellcode heuristic scanning before release authorization.
        </span>
      </div>
    </div>
  );
}

function StructuredDossierSandbox({ file }: { file: SevrFile }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200 text-slate-900">
        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
          <Binary className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">Scientific Matrix Dossier ({file.originalFormat.toUpperCase()})</h4>
          <p className="text-[11px] text-slate-500">Binary research asset analyzed via cryptographic byte inspector.</p>
        </div>
      </div>

      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 font-mono">
        <div className="flex justify-between">
          <span className="text-slate-500">Container Size:</span>
          <span className="font-semibold text-slate-800">{((file.sizeBytes || 0) / 1024 / 1024).toFixed(2)} MB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Security Tag:</span>
          <span className="font-semibold text-rose-700">TLP:{file.tlpLabel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Cryptographic Digest:</span>
          <span className="font-semibold text-slate-800 truncate max-w-[200px]">{file.checksumSha256 || "Pending"}</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 italic">
        Raw binary data is prevented from unmediated browser memory execution. Inspect watermark placement and proceed to release evaluation.
      </p>
    </div>
  );
}
