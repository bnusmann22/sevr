import React, { useState } from "react";
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight,
  Code2,
  Stamp,
  AlignVerticalJustifyStart,
  Info,
} from "lucide-react";
import type { SevrFile } from "../../types";
import TlpBadge from "../tlp/TlpBadge";
import type { WatermarkConfig } from "./SafePreviewRenderer";

interface WatermarkConfigPanelProps {
  file: SevrFile;
  projectName: string;
  config: WatermarkConfig;
  onChange: (updated: Partial<WatermarkConfig>) => void;
  onProceed: () => void;
}

export default function WatermarkConfigPanel({
  file,
  projectName,
  config,
  onChange,
  onProceed,
}: WatermarkConfigPanelProps) {
  const [isInspected, setIsInspected] = useState(false);
  const [showManifest, setShowManifest] = useState(false);
  const [touched, setTouched] = useState(false);

  // Validate institutional recipient email (.edu or .edu.ng)
  const isEmailValid = /^[^\s@]+@(?:[a-z0-9-]+\.)*(?:edu\.ng|edu)$/i.test(config.recipient.trim());
  const canProceed = isEmailValid && isInspected;

  const manifestJson = JSON.stringify(
    {
      schema: "https://sevr.institution.edu.ng/schemas/watermark-v1.json",
      recipient: config.recipient || "PENDING_SPECIFICATION",
      fileId: file.id,
      fileName: file.name,
      fileChecksum: file.checksumSha256 || "UNKNOWN",
      tlpClassification: file.tlpLabel,
      placement: config.placement,
      opacityPercentage: config.opacity,
      stampToken: config.watermarkId,
      enclaveTimestampUtc: config.timestamp,
    },
    null,
    2
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Stamp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Watermark & Attribution</h2>
            <p className="text-xs text-slate-500">Configure cryptographic recipient imprint</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Project & TLP Context Cards */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Enclave Project
            </span>
            <span className="font-semibold text-slate-800 truncate block mt-0.5">
              {projectName}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Governance Tag
            </span>
            <div className="mt-0.5">
              <TlpBadge label={file.tlpLabel} />
            </div>
          </div>
        </div>

        {/* Recipient Institutional Identity */}
        <div className="space-y-1.5">
          <label
            htmlFor="recipient-email"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            Target Recipient Email <span className="text-rose-500">*</span>
          </label>
          <input
            id="recipient-email"
            type="email"
            placeholder="e.g. fatima.garba@buk.edu.ng"
            value={config.recipient}
            onChange={(e) => onChange({ recipient: e.target.value })}
            onBlur={() => setTouched(true)}
            className={`w-full px-3 py-2 text-xs font-mono rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
              touched && !isEmailValid
                ? "border-rose-300 focus:ring-rose-200 bg-rose-50/20"
                : "border-slate-300 focus:ring-emerald-200 focus:border-emerald-500"
            }`}
          />
          {touched && !isEmailValid ? (
            <p className="text-[11px] text-rose-600 font-medium">
              Recipient must be an accredited institutional address (*.edu or *.edu.ng).
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              Identity will be indelibly rendered into the asset imprint.
            </p>
          )}
        </div>

        {/* Placement Style Toggle */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Watermark Layout Placement
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ placement: "diagonal" })}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                config.placement === "diagonal"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>Diagonal Stamp</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ placement: "banner" })}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                config.placement === "banner"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AlignVerticalJustifyStart className="w-3.5 h-3.5" />
              <span>Security Banner</span>
            </button>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="opacity-slider" className="font-bold text-slate-700 uppercase tracking-wider">
              Stamp Opacity
            </label>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
              {config.opacity}%
            </span>
          </div>
          <input
            id="opacity-slider"
            type="range"
            min={20}
            max={70}
            step={5}
            value={config.opacity}
            onChange={(e) => onChange({ opacity: Number(e.target.value) })}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>20% (Subtle)</span>
            <span>45% (Balanced)</span>
            <span>70% (High Contrast)</span>
          </div>
        </div>

        {/* Cryptographic Manifest Disclosure */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowManifest((prev) => !prev)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-slate-400" />
              Cryptographic Manifest Record
            </span>
            <span className="text-[10px] text-emerald-600 font-mono uppercase">
              {showManifest ? "Collapse [-]" : "Inspect [+]"}
            </span>
          </button>
          {showManifest && (
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[10px] font-mono overflow-x-auto leading-4 border border-slate-800">
              <code>{manifestJson}</code>
            </pre>
          )}
        </div>

        {/* Mandatory Policy Attestation Checkbox */}
        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-2">
          <div className="flex items-start gap-2.5">
            <input
              id="inspection-attestation"
              type="checkbox"
              checked={isInspected}
              onChange={(e) => setIsInspected(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-amber-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label
              htmlFor="inspection-attestation"
              className="text-xs text-amber-950 font-medium leading-relaxed cursor-pointer"
            >
              I have visually inspected this asset with the recipient watermark and verify it
              strictly adheres to institutional release policy and FIRST TLP 2.0 attribution constraints.
            </label>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <button
          type="button"
          onClick={onProceed}
          disabled={!canProceed}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          <span>Proceed to Release Review</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {!canProceed && (
          <p className="text-[11px] text-center text-slate-400">
            {!isEmailValid
              ? "Provide a valid .edu or .edu.ng recipient email"
              : "Confirm visual inspection checkbox to unlock release gate"}
          </p>
        )}
      </div>
    </div>
  );
}
