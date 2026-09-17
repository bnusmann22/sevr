import { useState } from "react";
import ShowcaseNavbar from "../../components/showcase/ShowcaseNavbar";
import ShowcaseFooter from "../../components/showcase/ShowcaseFooter";
import {
  Shield,
  Award,
  ChevronDown,
  Cpu,
  Layers,
  Database,
  Lock,
  Code2,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export default function ShowcaseAboutPage() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(1);
  const [activeNode, setActiveNode] = useState<string>("React 18 + TS 5");

  const techNodes = [
    { name: "React 18 + TS 5", category: "Frontend Core", detail: "Component isolation boundary & Zustand state management." },
    { name: "Three.js + R3F", category: "WebGL Graphics", detail: "3D enclave particle sphere & WebGL TLP spectrum canvas." },
    { name: "Keycloak OIDC PKCE", category: "Identity Gateway", detail: "OAuth 2.0 PKCE authentication flow (RFC 7636) & JWT claims." },
    { name: "FastAPI Engine", category: "Backend API", detail: "Python REST backend enforcing ABAC policy rules." },
    { name: "PostgreSQL", category: "Data Storage", detail: "Encrypted metadata storage & audit log transaction tracking." },
    { name: ".sevr Container Engine", category: "Container Wrapper", detail: "AES-256 GCM encrypted container packaging engine." },
  ];

  const charterItems = [
    {
      id: 1,
      title: "1. Problem Statement: Academic Data Leakage Vulnerability",
      content:
        "University research enclaves routinely manage sensitive intellectual property, clinical data, and defense-aligned datasets. Traditional cloud storage lacks mandatory containerization, allowing raw files to be forwarded or shared beyond authorized project perimeters. SeVR solves this via zero-trust policy enforcement.",
    },
    {
      id: 2,
      title: "2. FIRST TLP 2.0 Standardization",
      content:
        "SeVR adopts the Forum of Incident Response and Security Teams (FIRST) TLP 2.0 specification, standardizing sensitivity across CLEAR, GREEN, AMBER, AMBER+STRICT, and RED levels to ensure unambiguous user understanding across multi-institutional teams.",
    },
    {
      id: 3,
      title: "3. Cryptographic Hash-Chain Integrity",
      content:
        "Every file upload, permission change, and export decision is cryptographically chained using SHA-256 hashes. Any tampering with past log entries invalidates the verification chain, guaranteeing auditability for institutional compliance.",
    },
    {
      id: 4,
      title: "4. Pragmatic Minimalist Engineering (YAGNI)",
      content:
        "Built adhering strictly to YAGNI principles ('If It Works, Don't Make It Too Fancy'). Eliminates dual-engine bundle bloat (GSAP excluded in favor of Three.js + Framer Motion) and segregates the Public Educational Showcase from the Core Operational Platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <ShowcaseNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-800/80">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>ICSC 2026 Universities Hackathon (Track F1)</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Project Charter &amp; Architectural Tech Mesh
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            SeVR 1.0 was designed and engineered at Bayero University Kano to establish a sovereign benchmark for academic research data governance.
          </p>
        </section>

        {/* Interactive 2D SVG Tech Mesh Graph */}
        <section className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Component Architecture Mesh
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                2D Interactive Technology Node Graph
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Click any technology node to inspect its exact operational role within the SeVR enclave boundary.
            </p>
          </div>

          {/* Node Grid & Detail Surface */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Column (7 cols): SVG Graph & Buttons */}
            <div className="md:col-span-7 grid grid-cols-2 gap-3 font-mono text-xs">
              {techNodes.map((node) => {
                const active = activeNode === node.name;
                return (
                  <button
                    key={node.name}
                    onClick={() => setActiveNode(node.name)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      active
                        ? "bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-lg scale-[1.02]"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 uppercase block mb-1 font-semibold">
                      {node.category}
                    </span>
                    <span className="font-bold text-xs">{node.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Column (5 cols): Active Node Inspector */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <Cpu className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider text-xs">Node Inspector</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{activeNode}</h3>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {techNodes.find((n) => n.name === activeNode)?.detail}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                <span>Boundary: Zero-Trust Client</span>
                <span className="text-emerald-400 font-bold">VERIFIED</span>
              </div>
            </div>
          </div>
        </section>

        {/* Team Card & Institution Credits */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Lead Architect</h3>
            <p className="text-xs text-slate-300">Jamil Muhammad Abdullahi</p>
            <p className="text-[11px] text-slate-500 font-mono">Bayero University Kano (BUK)</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Award className="w-6 h-6 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Hackathon Track</h3>
            <p className="text-xs text-slate-300">ICSC 2026 Universities Hackathon</p>
            <p className="text-[11px] text-slate-500 font-mono">Track F1: Cybersecurity &amp; Sovereign Data</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Lock className="w-6 h-6 text-amber-400" />
            <h3 className="text-base font-bold text-white">Security Standards</h3>
            <p className="text-xs text-slate-300">FIRST TLP 2.0 &amp; RFC 7636 PKCE</p>
            <p className="text-[11px] text-slate-500 font-mono">NIST SP 800-171 / 800-53 Guidelines</p>
          </div>
        </section>

        {/* Project Charter Accordion */}
        <section className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
              Governance &amp; Guiding Principles
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              SeVR 1.0 Project Charter
            </h2>
          </div>

          <div className="space-y-3">
            {charterItems.map((item) => {
              const isOpen = openAccordion === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : item.id)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-white flex items-center justify-between hover:bg-slate-900/80 transition"
                  >
                    <span>{item.title}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-emerald-400" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-300 font-sans leading-relaxed border-t border-slate-900">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <ShowcaseFooter />
    </div>
  );
}
