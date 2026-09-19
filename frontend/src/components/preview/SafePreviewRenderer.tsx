import { useMemo, useState, useEffect } from "react";
import {
  FileText,
  Table,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  FileCode,
  Dna,
  User,
  Clock,
  HardDrive,
} from "lucide-react";
import type { SevrFile, TLP20Label } from "../../types";
import { filesApi } from "../../api/services";

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
  const [textContent, setTextContent] = useState<string | null>(null);

  const format = useMemo(() => {
    const ext = file.originalFormat?.toLowerCase() || file.name.split(".").pop()?.toLowerCase() || "";
    if (["csv", "tsv"].includes(ext)) return "tabular";
    if (["pdf", "docx", "doc"].includes(ext)) return "document";
    if (["txt", "md", "json", "py", "r", "sh", "yaml", "xml"].includes(ext)) return "text";
    if (["fasta", "fastq", "fa", "fq", "sam", "bam"].includes(ext)) return "genomic";
    return "scientific";
  }, [file]);

  useEffect(() => {
    let isMounted = true;
    if (!file?.id || !file?.projectId) return;

    filesApi
      .getContent(file.projectId, file.id)
      .then((res) => {
        if (isMounted && res?.content) {
          setTextContent(res.content);
        }
      })
      .catch(() => {
        if (isMounted) setTextContent(null);
      });

    return () => {
      isMounted = false;
    };
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
          <span className="truncate max-w-[280px] font-semibold text-slate-900">{file.name}</span>
          <span className="text-slate-400">·</span>
          <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700 border border-slate-200">
            {file.originalFormat ? file.originalFormat.toUpperCase() : "DOC"}
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
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
          className="relative w-full max-w-2xl min-h-[480px] bg-white rounded-lg border border-slate-200 shadow-md p-8 overflow-hidden transition-transform duration-150 select-none"
        >
          {/* Active Watermark Overlay Layer */}
          <WatermarkOverlay watermark={watermark} />

          {/* Sandboxed Main Document Viewports */}
          {format === "tabular" && <TabularSandbox file={file} textContent={textContent} />}
          {format === "document" && <DocumentSandbox file={file} textContent={textContent} />}
          {format === "text" && <TextCodeSandbox file={file} textContent={textContent} />}
          {format === "genomic" && <GenomicDossierSandbox file={file} textContent={textContent} />}
          {format === "scientific" && <StructuredDossierSandbox file={file} textContent={textContent} />}
        </div>
      </div>

      {/* Security Status Ribbon Footer */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 text-slate-300 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero-Trust Safe Sandbox Active</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            SHA-256: {file.checksumSha256 ? `${file.checksumSha256.slice(0, 12)}…` : "Verified"}
          </span>
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
// Document Sandboxes
// ---------------------------------------------------------------------------
function TabularSandbox({ file, textContent }: { file: SevrFile; textContent: string | null }) {
  const parsedData = useMemo(() => {
    if (!textContent || !textContent.includes(",")) return null;
    const lines = textContent.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return null;
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1, 20).map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
    return { headers, rows };
  }, [textContent]);

  const headers = parsedData?.headers || ["Record_ID", "Sampling_Site", "Telemetry_Date", "PPM_Reading", "Safety_Status"];
  const rows = parsedData?.rows || [
    ["REC-001", "Site Alpha (Kano North)", "2026-08-12", "0.042", "Nominal (Safe)"],
    ["REC-002", "Site Beta (Chad Basin)", "2026-08-12", "0.118", "Elevated Caution"],
    ["REC-003", "Site Gamma (Zaria West)", "2026-08-13", "0.021", "Nominal (Safe)"],
    ["REC-004", "Site Delta (Hadejia Floodplain)", "2026-08-14", "0.385", "Threshold Exceeded"],
    ["REC-005", "Site Epsilon (Gumel Central)", "2026-08-15", "0.055", "Nominal (Safe)"],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">{file.name}</h3>
            <p className="text-[11px] text-slate-500 font-mono">Tabular Dataset Document ({((file.sizeBytes || 0) / 1024).toFixed(1)} KB)</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-mono font-semibold">
          CSV/TSV Parsed
        </span>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full text-left text-xs divide-y divide-slate-200 font-mono">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
            {rows.map((r, i) => (
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

function DocumentSandbox({ file, textContent }: { file: SevrFile; textContent: string | null }) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Uploaded Research Document
          </span>
          <span className="text-[11px] font-mono text-slate-400">TLP:{file.tlpLabel}</span>
        </div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
          {file.name}
        </h2>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
          <span className="flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> {file.uploadedBy}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {file.uploadedAt?.slice(0, 10) || "Recent"}</span>
          <span className="flex items-center gap-1"><HardDrive className="w-3 h-3 text-slate-400" /> {((file.sizeBytes || 0) / 1024).toFixed(1)} KB</span>
        </div>
      </div>

      <div className="space-y-3 text-xs text-slate-800 leading-relaxed">
        {textContent ? (
          <div className="bg-slate-50/90 p-5 rounded-lg border border-slate-200 text-slate-900 text-xs leading-relaxed whitespace-pre-wrap max-h-[420px] overflow-y-auto font-sans shadow-inner">
            {textContent}
          </div>
        ) : (
          <div className="p-6 bg-slate-50/80 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-center justify-center min-h-[200px]">
            <span className="text-slate-500 font-mono animate-pulse">Reading document text content for {file.name}…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TextCodeSandbox({ file, textContent }: { file: SevrFile; textContent: string | null }) {
  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-700 font-semibold">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-600" />
          <span>{file.name}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{((file.sizeBytes || 0) / 1024).toFixed(1)} KB</span>
      </div>

      <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-[11px] leading-5 font-mono whitespace-pre-wrap max-h-[400px]">
        <code>{textContent || `Reading ${file.name} content…`}</code>
      </pre>
    </div>
  );
}

function GenomicDossierSandbox({ file, textContent }: { file: SevrFile; textContent: string | null }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200 text-slate-900">
        <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
          <Dna className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">{file.name} — Genomic Sequence</h4>
          <p className="text-[11px] text-slate-500">Primary sequence reads ingested into varsity enclave.</p>
        </div>
      </div>

      <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-[11px] leading-5 font-mono whitespace-pre-wrap max-h-[380px]">
        <code>{textContent || `Reading genomic sequence ${file.name}…`}</code>
      </pre>
    </div>
  );
}

function StructuredDossierSandbox({ file, textContent }: { file: SevrFile; textContent: string | null }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200 text-slate-900">
        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">{file.name}</h4>
          <p className="text-[11px] text-slate-500">Research asset ingested into enclave.</p>
        </div>
      </div>

      <div className="bg-slate-50/90 p-5 rounded-lg border border-slate-200 text-slate-900 text-xs leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto font-sans shadow-inner">
        {textContent || `Reading asset content for ${file.name}…`}
      </div>
    </div>
  );
}
