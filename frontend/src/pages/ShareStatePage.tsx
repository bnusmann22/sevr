import { Clock, ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ShareStatePageProps {
  type: "expired" | "invalid";
}

export default function ShareStatePage({ type }: ShareStatePageProps) {
  if (type === "expired") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100">
        <section className="w-full max-w-md rounded-xl border border-amber-500/20 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <Clock className="h-7 w-7" />
          </div>

          <header className="mt-6 text-center">
            <h1 className="text-xl font-bold tracking-tight text-white">Access Window Expired</h1>
            <p className="mt-2 text-sm text-slate-400">
              The external sharing link for this research asset has reached its scheduled expiration time and can no longer be accessed.
            </p>
          </header>

          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Security Rule:</span>
              <span className="font-semibold text-amber-400">Time-Bound Governance</span>
            </div>
            <div className="flex justify-between">
              <span>Remediation:</span>
              <span>Contact Enclave Principal Investigator</span>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" /> Return to SeVR Portal
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="w-full max-w-md rounded-xl border border-rose-500/20 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <header className="mt-6 text-center">
          <h1 className="text-xl font-bold tracking-tight text-white">Share Link Unavailable</h1>
          <p className="mt-2 text-sm text-slate-400">
            This external access link is invalid, revoked, or does not exist. No enclave metadata can be rendered.
          </p>
        </header>

        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400 space-y-2">
          <div className="flex justify-between">
            <span>Enclave Security:</span>
            <span className="font-semibold text-rose-400">Zero-Trust Isolation</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span>Unverified Access Attempt</span>
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Return to SeVR Portal
          </Link>
        </div>
      </section>
    </main>
  );
}
