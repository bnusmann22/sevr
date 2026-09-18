import { AlertCircle, ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/layout/Logo";

type AuthStatusPageProps = {
  mode: "callback" | "expired";
};

const content = {
  callback: {
    eyebrow: "Identity gateway",
    title: "Authentication callback",
    description: "The identity provider response will be processed here when OIDC is connected.",
    status: "Waiting for identity provider response",
    icon: LoaderCircle,
    iconClassName: "text-teal-600",
  },
  expired: {
    eyebrow: "Session boundary",
    title: "Your session has expired",
    description: "Sign in again to return to the protected research workspace.",
    status: "Your local session is no longer active",
    icon: AlertCircle,
    iconClassName: "text-amber-600",
  },
} as const;

export default function AuthStatusPage({ mode }: AuthStatusPageProps) {
  const state = content[mode];
  const Icon = state.icon;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7f6] px-6 py-12 text-slate-950">
      <section className="w-full max-w-md border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <Logo size="md" markClassName="bg-[#0b2528] text-teal-300" nameClassName="text-slate-950" />
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{state.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight text-slate-950">{state.title}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">{state.description}</p>
          <div className="mt-7 flex items-center gap-3 border-l-2 border-teal-600 bg-teal-50 px-4 py-3 text-sm text-slate-700" role="status">
            <Icon className={`h-5 w-5 flex-none ${state.iconClassName} ${mode === "callback" ? "animate-spin" : ""}`} />
            <span>{state.status}</span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {mode === "expired" ? (
              <Link to="/login" className="inline-flex items-center gap-2 bg-[#0b2528] px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-900">
                <LockKeyhole className="h-4 w-4" />
                Return to sign in
              </Link>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 bg-[#0b2528] px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-900">
                <CheckCircle2 className="h-4 w-4" />
                Continue to sign in
              </Link>
            )}
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              Public showcase
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
