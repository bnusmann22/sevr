import { FormEvent, useState } from "react";
import { X, Share2, Mail, Clock, Link as LinkIcon, Check, Copy } from "lucide-react";
import { apiClient } from "../../api/client";


const INSTITUTION_EMAIL_PATTERN = /^[^\s@]+@(?:[a-z0-9-]+\.)*(?:edu\.ng|edu)$/i;

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId?: string;
  projectId?: string;
  artifactType?: "native" | "sevr_container";
}

export default function ShareDialog({
  isOpen,
  onClose,
  fileId = "file_1",
  projectId = "p1",
  artifactType = "native",
}: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [expiryHours, setExpiryHours] = useState("24");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!INSTITUTION_EMAIL_PATTERN.test(email)) {
      setError("Recipient email must belong to an institutional domain (*.edu.ng, *.edu).");
      return;
    }

    const hours = parseInt(expiryHours, 10);
    if (isNaN(hours) || hours <= 0) {
      setError("Expiration hours must be greater than 0.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post("/share/create", {
        fileId,
        projectId,
        recipientEmail: email,
        artifactType,
        expiresInHours: hours,
      });

      const fullUrl = `${window.location.origin}${response.data.shareUrl}`;
      setResultUrl(fullUrl);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate share token link.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultUrl) return;
    navigator.clipboard.writeText(resultUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            Share File Externally
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          External collaborators receive a short-lived, cryptographically verified share token link.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              Recipient Email (Institutional Only)
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="evaluator@oxford.edu"
              className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Link Expiration Window
            </label>
            <select
              value={expiryHours}
              onChange={(event) => setExpiryHours(event.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="1">1 Hour (High Sensitivity)</option>
              <option value="12">12 Hours</option>
              <option value="24">24 Hours (Default)</option>
              <option value="48">48 Hours (Standard Review)</option>
              <option value="168">7 Days (Maximum Limit)</option>
            </select>
          </div>

          {error && <p role="alert" className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</p>}

          {resultUrl && (
            <div role="status" className="border border-emerald-200 bg-emerald-50 p-3.5 rounded-lg space-y-2">
              <p className="text-xs font-semibold text-emerald-900">Share Link Generated Successfully:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={resultUrl}
                  className="w-full text-[11px] font-mono p-1.5 border border-emerald-300 rounded bg-white text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 transition shadow-sm"
            >
              {loading ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <LinkIcon className="w-3.5 h-3.5" />
              )}
              <span>Generate Scoped Link</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
