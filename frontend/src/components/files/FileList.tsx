import type { SevrFile } from "../../types";
import FileCard from "./FileCard";
import { FolderOpen } from "lucide-react";

export default function FileList({ files }: { files: SevrFile[] }) {
  if (!files || files.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-500 text-sm">
        <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="font-semibold text-slate-800">No Enclave Files</p>
        <p className="text-xs text-slate-500 mt-1">No files uploaded to this enclave workspace yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
}
