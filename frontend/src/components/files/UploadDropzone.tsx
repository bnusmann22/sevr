import { UploadCloud } from "lucide-react";

export default function UploadDropzone() {
  return (
    <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 transition rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 cursor-pointer group">
      <div className="flex justify-center mb-3">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>
      </div>
      <h3 className="font-semibold text-sm text-slate-800">
        Drag &amp; drop research dataset or document
      </h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        Supports any format (CSV, PDF, HDF5, FASTA). Initial TLP classification assigned on upload.
      </p>
      <div className="mt-4">
        <span className="inline-block bg-white text-slate-700 text-xs px-3.5 py-1.5 rounded-lg border border-slate-200 font-medium shadow-xs group-hover:bg-slate-50">
          Browse Files
        </span>
      </div>
    </div>
  );
}
