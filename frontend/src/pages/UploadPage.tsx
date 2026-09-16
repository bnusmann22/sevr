import { useState } from "react";
import type { TLPLabel } from "../types";

export default function UploadPage() {
  const [label, setLabel] = useState<TLPLabel>("AMBER");

  // TODO: wire to POST /projects/:id/files once the backend endpoint exists.
  // The upload itself is unrestricted by format (PRD 4.2 "Any-format upload").

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">Upload a file</h1>
      <div className="border-2 border-dashed border-neutral-300 rounded p-8 text-center text-neutral-500 mb-4">
        Drop a file here, or click to browse (any format accepted)
      </div>
      <label className="block text-sm font-medium mb-1">TLP label</label>
      <select
        className="border border-neutral-300 rounded px-3 py-2 w-full"
        value={label}
        onChange={(e) => setLabel(e.target.value as TLPLabel)}
      >
        <option value="WHITE">WHITE: no confidentiality requirement</option>
        <option value="GREEN">GREEN: internal collaboration</option>
        <option value="AMBER">AMBER: sensitive, pre-publication</option>
        <option value="RED">RED: irreversible harm if exposed</option>
      </select>
      <p className="text-xs text-neutral-500 mt-2">
        A default label is suggested by file type, but is always confirmed by a human, per PRD Section 3, step 2.
      </p>
    </div>
  );
}
