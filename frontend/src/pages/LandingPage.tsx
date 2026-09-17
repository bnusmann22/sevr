import { Link } from "react-router-dom";
import { Shield, Lock, FileCheck, ArrowRight, LogIn, Award } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-8">
      <header className="flex justify-between items-center max-w-5xl mx-auto w-full py-4 border-b border-slate-800">
        <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
            <Shield className="w-4 h-4 text-slate-950" />
          </div>
          SeVR 1.0
        </h1>
        <Link
          to="/login"
          className="px-4 py-2 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 transition flex items-center gap-1.5 shadow-sm"
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign in with Keycloak
        </Link>
      </header>

      <main className="max-w-3xl mx-auto text-center py-16">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-800/80">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          Public Showcase Portal
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-6 text-white leading-tight">
          Scoped Enclave for Varsity Research
        </h2>
        <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-xl mx-auto">
          Zero-Trust data security, Traffic Light Protocol (TLP) enforcement, automated forced .sevr container encryption, and tamper-evident audit logging for university research enclaves.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            Launch Demo Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 text-left">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <Shield className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-xs text-white">TLP Enforcement</h3>
            <p className="text-[11px] text-slate-400 mt-1">Granular Traffic Light Protocol categorization on all research assets.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <Lock className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-xs text-white">Forced Encrypted Containers</h3>
            <p className="text-[11px] text-slate-400 mt-1">Automatic .sevr packaging for sensitive exports & external sharing.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <FileCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-xs text-white">Tamper-Evident Audit</h3>
            <p className="text-[11px] text-slate-400 mt-1">Immutable record of every access, export, and classification change.</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 border-t border-slate-900 pt-6">
        SeVR 1.0 · Bayero University Kano · ICSC 2026 Universities Hackathon
      </footer>
    </div>
  );
}
