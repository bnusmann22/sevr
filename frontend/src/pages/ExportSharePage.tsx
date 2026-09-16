import { useState } from "react";
import { apiClient } from "../api/client";
import type { ExportDecision } from "../types";

const FILE_ID = "file_1"; // AMBER-labelled in the mock data — try file_2 (RED) to see the hard floor

export default function ExportSharePage() {
  const [overrideRequested, setOverrideRequested] = useState(false);
  const [decision, setDecision] = useState<ExportDecision | null>(null);

  async function requestExport() {
    const res = await apiClient.post<ExportDecision>(`/files/${FILE_ID}/export`, { overrideRequested });
    setDecision(res.data);
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">Export &amp; Share</h1>
      <label className="flex items-center gap-2 text-sm mb-4">
        <input type="checkbox" checked={overrideRequested} onChange={(e) => setOverrideRequested(e.target.checked)} />
        Request supervisor override (ignored for RED — PRD Section 5.1)
      </label>
      <button onClick={requestExport} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">
        Request export
      </button>

      {decision && (
        <div className="mt-4 border border-neutral-200 rounded p-4 text-sm">
          <p className="font-medium">
            Outcome: {decision.outcome === "native" ? "Native format" : ".sevr container"}
          </p>
          <p className="text-neutral-600 mt-1">{decision.reason}</p>
        </div>
      )}
    </div>
  );
}
