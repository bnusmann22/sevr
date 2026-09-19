import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, ShieldCheck, Clock, FileText, Lock, AlertCircle, Building2 } from "lucide-react";
import { apiClient } from "../api/client";
import TlpBadge from "../components/tlp/TlpBadge";
import ShareStatePage from "./ShareStatePage";
import { TLPLabel } from "../types";

interface TokenInfo {
  valid: boolean;
  status: "active" | "expired" | "invalid";
  fileId?: string;
  fileName?: string;
  originalFormat?: string;
  tlpLabel?: TLPLabel;
  recipientEmail?: string;
  artifactType?: "native" | "sevr_container";
  expiresAt?: string;
}

export default function ExternalCollaboratorPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    apiClient
      .get(`/share/${token}/validate`)
      .then((res: { data: TokenInfo }) => {
        if (!isMounted) return;
        const data: TokenInfo = res.data;
        setTokenInfo(data);

        if (data.status === "expired") {
          navigate(`/share/${token}/expired`, { replace: true });
          return;
        }
        if (data.status === "invalid" || !data.valid) {
          navigate(`/share/${token}/invalid`, { replace: true });
          return;
        }

        if (data.expiresAt) {
          const diffMs = new Date(data.expiresAt).getTime() - new Date().getTime();
          setRemainingSeconds(Math.max(0, Math.floor(diffMs / 1000)));
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setTokenInfo({ valid: false, status: "invalid" });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  // Live countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          navigate(`/share/${token}/expired`, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [remainingSeconds, token, navigate]);

  const handleDownload = async () => {
    if (!token) return;
    setDownloading(true);
    setErrorMsg(null);

    try {
      const response = await apiClient.get(`/share/${token}/download`, {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let filename = tokenInfo?.fileName || "research_asset";
      if (tokenInfo?.artifactType === "sevr_container" && !filename.endsWith(".sevr")) {
        filename = `${filename}.sevr`;
      }

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to download research asset.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400 font-medium">Validating enclave share token...</p>
        </div>
      </main>
    );
  }

  if (!tokenInfo || !tokenInfo.valid || tokenInfo.status === "invalid") {
    return <ShareStatePage type="invalid" />;
  }

  if (tokenInfo.status === "expired") {
    return <ShareStatePage type="expired" />;
  }

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const timeString = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100 font-sans">
      <section className="w-full max-w-lg space-y-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        {/* Header Badge */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                SeVR Governance Portal
              </p>
              <h1 className="text-lg font-bold text-white">Scoped Collaborator Access</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-400">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Varsity Enclave</span>
          </div>
        </header>

        {/* Recipient Verification */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Issued to authorized recipient:</span>
          </div>
          <span className="font-mono font-semibold text-emerald-200">{tokenInfo.recipientEmail}</span>
        </div>

        {/* Asset Details Grid */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-sky-400 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-white leading-snug">{tokenInfo.fileName}</h2>
                <span className="text-xs text-slate-400 uppercase font-mono">{tokenInfo.originalFormat} File</span>
              </div>
            </div>
            {tokenInfo.tlpLabel && <TlpBadge label={tokenInfo.tlpLabel} />}
          </div>

          <hr className="border-slate-800/80" />

          <dl className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-500 font-medium">Container Package</dt>
              <dd className="mt-1 font-mono text-slate-300 flex items-center gap-1">
                {tokenInfo.artifactType === "sevr_container" ? (
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-amber-400 font-semibold border border-amber-500/20">
                    .sevr Container
                  </span>
                ) : (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 font-semibold">
                    Native Format
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Access Window Countdown</dt>
              <dd className="mt-1 font-mono font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>{timeString}</span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Warning Banner for Container Encryption */}
        {tokenInfo.artifactType === "sevr_container" && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-amber-400" /> Enclave Policy Mandate (.sevr Encapsulated)
            </p>
            <p className="text-slate-300 leading-relaxed">
              This asset is cryptographically sealed in a <code className="text-amber-300 font-semibold">.sevr</code> container
              requiring Ed25519 signature verification and AES-256-GCM authentication.
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 transition"
        >
          {downloading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Preparing Download...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download Research Asset</span>
            </>
          )}
        </button>

        <footer className="text-center text-[11px] text-slate-500">
          Enclave Watermarking & Cryptographic Provenance Enforced
        </footer>
      </section>
    </main>
  );
}