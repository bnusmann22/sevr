import { useState } from "react";
import ShowcaseNavbar from "../../components/showcase/ShowcaseNavbar";
import ShowcaseFooter from "../../components/showcase/ShowcaseFooter";
import {
  BookOpen,
  Shield,
  CheckCircle2,
  Server,
  Terminal,
} from "lucide-react";

export default function ShowcaseDocsPage() {
  const [activeTab, setActiveTab] = useState<"arch" | "tlp" | "api" | "compliance">("arch");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 md:bg-[#090a0f] md:text-zinc-100 flex flex-col font-sans selection:bg-slate-200 selection:text-slate-900 md:selection:bg-zinc-800 md:selection:text-zinc-100">
      <ShowcaseNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-700 bg-slate-200 border-slate-300 md:text-emerald-400 md:bg-zinc-900 md:border-zinc-800 px-3 py-1.5 rounded-full border">
            <BookOpen className="w-4 h-4 text-emerald-700 md:text-emerald-400" />
            <span>Public Enclave Specification Docs</span>
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 md:text-white tracking-tight sm:text-5xl">
            Documentation &amp; Compliance Portal
          </h1>

          <p className="text-slate-600 md:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Technical reference manual detailing SeVR 1.0 zero-trust deployment architecture, TLP 2.0 policy rules, REST API specifications, and NIST SP 800-171 compliance controls.
          </p>
        </section>

        {/* Tab Navigation */}
        <section className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-slate-300 md:bg-zinc-900/60 md:border-zinc-800 border space-y-8 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-slate-200 md:border-zinc-800 pb-4 overflow-x-auto">
            {[
              { id: "arch", label: "Deployment Architecture", icon: Server },
              { id: "tlp", label: "FIRST TLP 2.0 Specification", icon: Shield },
              { id: "api", label: "REST API & OAuth PKCE", icon: Terminal },
              { id: "compliance", label: "NIST SP 800-171 Matrix", icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shrink-0 ${
                    active
                      ? "bg-slate-200 text-slate-900 border-slate-300 md:bg-zinc-100 md:text-zinc-950 font-bold border shadow-sm"
                      : "bg-white text-slate-600 hover:text-slate-900 border-slate-300 md:bg-zinc-900 md:text-zinc-400 md:hover:text-white md:border-zinc-800 border"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content 1: Deployment Architecture */}
          {activeTab === "arch" && (
            <div className="space-y-6 font-sans text-xs">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 md:text-white">Dual-Track Enclave Isolation</h3>
                <p className="text-slate-600 md:text-zinc-300 leading-relaxed max-w-3xl">
                  SeVR 1.0 strictly isolates the unauthenticated Public Educational Showcase (Track A) from the authenticated Operational Research Enclave (Track B). Token-bound requests pass through Keycloak OIDC PKCE handlers before contacting FastAPI API services.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border-slate-300 md:bg-[#0d0e14] md:border-zinc-800 border font-mono text-xs space-y-3">
                <div className="text-emerald-700 md:text-emerald-400 font-bold">CLIENT BROWSER LAYER (React 18 SPA)</div>
                <div className="pl-4 text-slate-600 border-slate-300 md:text-zinc-400 md:border-zinc-800 border-l space-y-2">
                  <div>├── Track A: / (ShowcaseOverview), /security, /workflows, /sevr, /docs</div>
                  <div>└── Track B: /login -&gt; Keycloak PKCE Redirect -&gt; /home, /projects, /audit, /alerts</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: FIRST TLP 2.0 Spec */}
          {activeTab === "tlp" && (
            <div className="space-y-6 text-xs font-sans">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 md:text-white">FIRST Traffic Light Protocol (TLP 2.0)</h3>
                <p className="text-slate-600 md:text-zinc-300 leading-relaxed max-w-3xl">
                  The FIRST TLP 2.0 standard defines four primary color designations plus one strict sub-designation to govern information sharing boundaries across research organizations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border-slate-300 md:bg-[#0d0e14] md:border-zinc-800 border space-y-2">
                  <span className="text-slate-800 md:text-zinc-200 font-bold">TLP:CLEAR</span>
                  <p className="text-slate-600 md:text-zinc-400 font-sans text-xs">Public research papers and unrestricted datasets.</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border-emerald-300 md:bg-[#0d0e14] md:border-emerald-900/60 border space-y-2">
                  <span className="text-emerald-800 md:text-emerald-400 font-bold">TLP:GREEN</span>
                  <p className="text-slate-700 md:text-zinc-400 font-sans text-xs">Shared with sector peers &amp; academic consortiums.</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border-amber-300 md:bg-[#0d0e14] md:border-amber-900/60 border space-y-2">
                  <span className="text-amber-800 md:text-amber-400 font-bold">TLP:AMBER / TLP:AMBER+STRICT</span>
                  <p className="text-slate-700 md:text-zinc-400 font-sans text-xs">Need-to-know organization bound. Forced container encryption.</p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/60 border-rose-300 md:bg-[#0d0e14] md:border-rose-900/60 border space-y-2">
                  <span className="text-rose-800 md:text-rose-400 font-bold">TLP:RED</span>
                  <p className="text-slate-700 md:text-zinc-400 font-sans text-xs">Restricted Enclave Eyes-Only. PI cryptographic authorization required.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: REST API & PKCE */}
          {activeTab === "api" && (
            <div className="space-y-6 text-xs font-sans">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 md:text-white">OAuth 2.0 PKCE &amp; REST Endpoints</h3>
                <p className="text-slate-600 md:text-zinc-300 leading-relaxed max-w-3xl">
                  Authenticates using RFC 7636 Authorization Code with Proof Key for Code Exchange (PKCE) to mitigate authorization code interception attacks in public clients.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border-slate-300 md:bg-[#0d0e14] md:border-zinc-800 border font-mono text-xs space-y-3">
                <div className="text-cyan-700 md:text-cyan-400 font-bold">POST /api/v1/auth/pkce-exchange</div>
                <pre className="text-slate-800 bg-white border-slate-300 md:text-zinc-400 md:bg-zinc-900 md:border-zinc-800 border p-3 rounded-lg overflow-x-auto text-[11px]">
{`{
  "grant_type": "authorization_code",
  "client_id": "sevr-react-client",
  "code": "AUTH_CODE_FROM_KEYCLOAK",
  "code_verifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
}`}
                </pre>
              </div>
            </div>
          )}

          {/* Tab Content 4: NIST Compliance */}
          {activeTab === "compliance" && (
            <div className="space-y-6 text-xs font-sans">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 md:text-white">NIST SP 800-171 Compliance Controls</h3>
                <p className="text-slate-600 md:text-zinc-300 leading-relaxed max-w-3xl">
                  SeVR 1.0 implements technical controls aligned with NIST Special Publication 800-171 for Protecting Controlled Unclassified Information (CUI) in Nonfederal Systems.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border-slate-300 md:bg-[#0d0e14] md:border-zinc-800 border flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 md:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 md:text-white">3.1.1 Access Control (AC-2/AC-3)</span>
                    <p className="text-slate-600 md:text-zinc-400 font-sans text-xs mt-1">Enforces Attribute-Based Access Control (ABAC) and Role-Based Access Control (RBAC) on all enclave research objects.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border-slate-300 md:bg-[#0d0e14] md:border-zinc-800 border flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 md:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 md:text-white">3.3.1 Audit and Accountability (AU-2/AU-6)</span>
                    <p className="text-slate-600 md:text-zinc-400 font-sans text-xs mt-1">Cryptographic SHA-256 hash chains guarantee tamper-evident event logging for all data access and export operations.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <ShowcaseFooter />
    </div>
  );
}
