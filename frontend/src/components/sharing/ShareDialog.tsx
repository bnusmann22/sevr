import { FormEvent, useState } from "react";
import { X, Share2, Mail, Clock, Link } from "lucide-react";

export default function ShareDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [expiry, setExpiry] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  if (!isOpen) return null;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid recipient email."); return; }
    if (!expiry || new Date(expiry) <= new Date()) { setError("Expiry must be in the future."); return; }
    setError(""); setResult("https://demo.sevr.local/share/mock-review-link");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            Share File Externally
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          External collaborators receive a short-lived scoped link. Time expiration is mandatory.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              Recipient Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="collaborator@external-univ.edu"
              className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Access Expiry (Required)
            </label>
            <input
              type="datetime-local"
              value={expiry}
              onChange={(event) => setExpiry(event.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
          {result && <div role="status" className="break-all border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">Demo link generated: {result}</div>}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 transition shadow-sm"
            >
              <Link className="w-3.5 h-3.5" />
              Generate Scoped Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
