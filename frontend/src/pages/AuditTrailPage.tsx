import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import type { AuditEntry } from "../types";

const PROJECT_ID = "proj_1";

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    apiClient.get<AuditEntry[]>(`/projects/${PROJECT_ID}/audit`).then((res) => setEntries(res.data));
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Audit Trail</h1>
      <div className="border border-neutral-200 rounded divide-y text-sm">
        {entries.map((e) => (
          <div key={e.id} className="p-3 flex justify-between">
            <span>{e.detail}</span>
            <span className="text-neutral-400">{new Date(e.timestamp).toLocaleString()}</span>
          </div>
        ))}
        {entries.length === 0 && <p className="p-3 text-neutral-500">No activity yet.</p>}
      </div>
    </div>
  );
}
