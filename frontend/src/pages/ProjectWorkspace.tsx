import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import TLPBadge from "../components/TLPBadge";
import type { SevrFile } from "../types";

const PROJECT_ID = "proj_1"; // TODO: replace with real project selection once auth/roles exist

export default function ProjectWorkspace() {
  const [files, setFiles] = useState<SevrFile[]>([]);

  useEffect(() => {
    apiClient.get<SevrFile[]>(`/projects/${PROJECT_ID}/files`).then((res) => setFiles(res.data));
  }, []);

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Project Workspace</h1>
      <div className="border border-neutral-200 rounded divide-y">
        {files.map((f) => (
          <div key={f.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{f.name}</p>
              <p className="text-sm text-neutral-500">
                {f.originalFormat.toUpperCase()} · v{f.versionCount} · uploaded by {f.uploadedBy}
              </p>
            </div>
            <TLPBadge label={f.tlpLabel} />
          </div>
        ))}
        {files.length === 0 && <p className="p-4 text-sm text-neutral-500">No files yet.</p>}
      </div>
    </div>
  );
}
