import { Link } from "react-router-dom";
import { Shield, Lock, ExternalLink, Mail, Award, CheckCircle2 } from "lucide-react";

export default function ShowcaseFooter() {
  return (
    <footer className="bg-[#090a0f] border-t border-zinc-900 text-zinc-400 py-12 text-xs relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight">SeVR 1.0</span>
                <p className="text-[10px] font-mono text-zinc-400">Scoped Enclave for Varsity Research</p>
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              Sovereign academic research enclave platform engineered for zero-trust data protection, FIRST TLP 2.0 policy enforcement, automated forced <code className="text-emerald-400 font-mono text-[11px] bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">.sevr</code> container encryption, and immutable hash-chained audit logging.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>NIST SP 800-171 / RFC 7636 Compliant</span>
              </div>
            </div>
          </div>

          {/* Column 1: Platform & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
              Security &amp; Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  Overview &amp; Benchmarks
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-emerald-400 transition-colors">
                  TLP 2.0 Security Spectrum
                </Link>
              </li>
              <li>
                <Link to="/sevr" className="hover:text-emerald-400 transition-colors">
                  .sevr Container Format
                </Link>
              </li>
              <li>
                <Link to="/workflows" className="hover:text-emerald-400 transition-colors">
                  ABAC Workflow Simulator
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  All Enclaves Operational
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
              Legal &amp; Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy &amp; Data Rights Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Enclave Service
                </Link>
              </li>
              <li>
                <Link to="/docs#compliance" className="hover:text-emerald-400 transition-colors">
                  NIST SP 800-171 Statement
                </Link>
              </li>
              <li>
                <Link to="/docs#tlp-spec" className="hover:text-emerald-400 transition-colors">
                  FIRST TLP 2.0 Standard Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Creators & Institution */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
              Academic Charter
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-zinc-300">
                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ICSC 2026 Hackathon (Track F1)</span>
              </li>
              <li className="text-zinc-400 font-mono text-[11px]">
                Bayero University Kano (BUK)
              </li>
              <li className="text-zinc-400">
                Lead Architect: Jamil Muhammad Abdullahi
              </li>
              <li>
                <a
                  href="mailto:support@sevr.edu.ng"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:underline text-[11px] font-mono mt-1"
                >
                  <Mail className="w-3 h-3" />
                  Contact Admin Helpdesk
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Metadata Ribbon */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-zinc-400">
          <div>
            © 2026 SeVR 1.0 Project Charter · Bayero University Kano. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-zinc-400">
              <Lock className="w-3 h-3 text-emerald-400" />
              OAuth 2.0 PKCE Enclave
            </span>
            <span className="text-zinc-800">|</span>
            <Link to="/docs" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>Developer API Specs</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
