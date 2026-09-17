import { useState } from "react";
import type { TLPLabel } from "../types";
import TlpSelector from "../components/tlp/TlpSelector";
import UploadDropzone from "../components/files/UploadDropzone";
import { Upload, Shield, Info, CheckCircle } from "lucide-react";

export default function UploadPage() {
  const [label, setLabel] = useState<TLPLabel>("AMBER");
  const [isUploaded, setIsUploaded] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-600" />
          Upload Research Asset
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload any dataset or document format into the Zero-Trust enclave with mandatory TLP classification.
        </p>
      </div>

      <UploadDropzone />

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Assign Traffic Light Protocol (TLP) Classification
          </label>
          <TlpSelector value={label} onChange={setLabel} canOverrideRed={false} />
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            A default TLP label is pre-suggested based on file content heuristics, but must be explicitly confirmed by a researcher before enclave ingestion (PRD Section 3).
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsUploaded(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Ingest &amp; Classify Asset
          </button>
        </div>

        {isUploaded && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            File successfully ingested with TLP:{label} classification.
          </div>
        )}
      </div>
    </div>
  );
}
