import { useState } from "react";
import ShowcaseNavbar from "../../components/showcase/ShowcaseNavbar";
import ShowcaseFooter from "../../components/showcase/ShowcaseFooter";
import {
  Shield,
  Lock,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Key,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";

type TlpLevel = "CLEAR" | "GREEN" | "AMBER" | "AMBER_STRICT" | "RED";

export default function ShowcaseSecurityPage() {
  const [selectedTlp, setSelectedTlp] = useState<TlpLevel>("AMBER");
  const [step, setStep] = useState<number>(1);
  const [hashSimulated, setHashSimulated] = useState<boolean>(true);

  const tlpDetails = {
    CLEAR: {
      color: "text-zinc-200",
      bgColor: "bg-zinc-900",
      borderColor: "border-zinc-700",
      badgeColor: "bg-zinc-800 text-zinc-200 border-zinc-600",
      title: "TLP:CLEAR (Public / Unrestricted)",
      sharingScope: "World / Public Academic Repositories",
      exportOutcome: "Native Format Direct Download Allowed",
      outcomeType: "native",
      rules: [
        "Unrestricted distribution allowed.",
        "No container encryption required.",
        "Standard metadata logging applied.",
      ],
    },
    GREEN: {
      color: "text-emerald-400",
      bgColor: "bg-zinc-900",
      borderColor: "border-emerald-900/60",
      badgeColor: "bg-zinc-900 text-emerald-400 border-emerald-800",
      title: "TLP:GREEN (Community / Academic Sector)",
      sharingScope: "University Consortium & Verified Peers",
      exportOutcome: "Native Format (Same Dept) / Forced .sevr Container (Cross Dept)",
      outcomeType: "conditional",
      rules: [
        "Direct export allowed within same academic department.",
        "Forced .sevr container packaging when shared cross-department.",
        "ABAC verification required at download time.",
      ],
    },
    AMBER: {
      color: "text-amber-400",
      bgColor: "bg-zinc-900",
      borderColor: "border-amber-900/60",
      badgeColor: "bg-zinc-900 text-amber-400 border-amber-800",
      title: "TLP:AMBER (Need-to-Know Organization)",
      sharingScope: "Bounded Project Team Members Only",
      exportOutcome: "Mandatory Forced .sevr Encrypted Container",
      outcomeType: "container",
      rules: [
        "Direct raw file export strictly blocked.",
        "Automatic .sevr container encryption with expiration timer.",
        "PI manual override required for un-containerized export.",
      ],
    },
    AMBER_STRICT: {
      color: "text-orange-400",
      bgColor: "bg-zinc-900",
      borderColor: "border-orange-900/60",
      badgeColor: "bg-zinc-900 text-orange-400 border-orange-800",
      title: "TLP:AMBER+STRICT (Strict Organization Enclosure)",
      sharingScope: "Strictly Home Department & Project Members",
      exportOutcome: "Forced .sevr Container + Zero External Share Links",
      outcomeType: "container_strict",
      rules: [
        "External share link creation strictly disabled.",
        "Requires active Keycloak OIDC session for decryption.",
        "Logged in supervisor audit queue.",
      ],
    },
    RED: {
      color: "text-rose-400",
      bgColor: "bg-zinc-900",
      borderColor: "border-rose-900/60",
      badgeColor: "bg-zinc-900 text-rose-400 border-rose-800",
      title: "TLP:RED (Restricted Enclave Eyes-Only)",
      sharingScope: "Named Enclave Researchers Only",
      exportOutcome: "EXPORT BLOCKED (PI Explicit Multi-Party Approval Required)",
      outcomeType: "blocked",
      rules: [
        "All export attempts blocked by default enclave guard.",
        "Requires dual PI cryptographic signature for enclave release.",
        "Triggers real-time alert in Security Oversight Queue.",
      ],
    },
  };

  const currentTlpInfo = tlpDetails[selectedTlp];

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <ShowcaseNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>NIST SP 800-171 &amp; FIRST TLP 2.0 Compliance</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Security Architecture &amp; Policy Controls
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            SeVR 1.0 combines fine-grained Attribute-Based Access Control (ABAC), FIRST TLP 2.0 sensitivity categorization, automated <code className="text-emerald-400 font-mono text-xs">.sevr</code> container transformation, and cryptographic hash chains.
          </p>
        </section>

        {/* Interactive TLP 2.0 Spectrum Visualizer */}
        <section className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Interactive Security Simulator
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                FIRST TLP 2.0 Spectrum Engine
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-md">
              Click any TLP level to simulate how the SeVR Export Engine dynamically evaluates policy rules and determines container outcomes.
            </p>
          </div>

          {/* Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
            {(["CLEAR", "GREEN", "AMBER", "AMBER_STRICT", "RED"] as TlpLevel[]).map((level) => {
              const active = selectedTlp === level;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedTlp(level)}
                  className={`p-3 rounded-xl border text-center font-bold transition-all duration-200 ${
                    active
                      ? `${tlpDetails[level].bgColor} ${tlpDetails[level].borderColor} ${tlpDetails[level].color} shadow-sm scale-[1.02] ring-1 ring-zinc-700`
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  TLP:{level.replace("_", "+")}
                </button>
              );
            })}
          </div>

          {/* Dynamic Policy Outcome Visualizer Surface */}
          <div
            className={`p-6 rounded-2xl border transition-all duration-300 ${currentTlpInfo.bgColor} ${currentTlpInfo.borderColor} space-y-6`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div className="space-y-1">
                <span className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold border ${currentTlpInfo.badgeColor}`}>
                  {currentTlpInfo.title}
                </span>
                <p className="text-xs text-zinc-300 font-medium pt-1">
                  Scope: <span className="text-white">{currentTlpInfo.sharingScope}</span>
                </p>
              </div>

              {/* Outcome Badge */}
              <div className="p-3 rounded-xl bg-[#0d0e14] border border-zinc-800 text-right space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Export Decision Outcome
                </span>
                <span className={`text-xs font-mono font-bold ${currentTlpInfo.color}`}>
                  {currentTlpInfo.exportOutcome}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {currentTlpInfo.rules.map((rule, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0d0e14] border border-zinc-800 flex items-start gap-2">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${currentTlpInfo.color}`} />
                  <span className="text-zinc-300 font-sans">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Native to .sevr Encrypted Container Transformation Diagram */}
        <section className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
              Container Encapsulation Engine
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Native File to <code className="text-emerald-400 font-mono">.sevr</code> Container Pipeline
            </h2>
            <p className="text-xs text-zinc-400">
              Step-by-step visual demonstration of raw academic research files being packaged into tamper-evident encrypted containers.
            </p>
          </div>

          {/* Interactive Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div
              onClick={() => setStep(1)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                step === 1
                  ? "bg-zinc-900 border-emerald-500 shadow-md"
                  : "bg-[#0d0e14] border-zinc-800 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 font-mono text-xs font-bold text-emerald-400 flex items-center justify-center">
                  01
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Input Payload</span>
              </div>
              <h3 className="font-bold text-sm text-white mb-1">Raw Academic File</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Research dataset, PDF paper, or genomic sequence file uploaded by researcher.
              </p>
              <div className="mt-4 p-2 bg-[#090a0f] rounded font-mono text-[11px] text-zinc-300 border border-zinc-800 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>genome_sample_A1.csv</span>
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setStep(2)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                step === 2
                  ? "bg-zinc-900 border-amber-500 shadow-md"
                  : "bg-[#0d0e14] border-zinc-800 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 font-mono text-xs font-bold text-amber-400 flex items-center justify-center">
                  02
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Policy Evaluation</span>
              </div>
              <h3 className="font-bold text-sm text-white mb-1">TLP 2.0 &amp; ABAC Check</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Export Decision Engine inspects user role, department, recipient target, and TLP label.
              </p>
              <div className="mt-4 p-2 bg-[#090a0f] rounded font-mono text-[11px] text-amber-400 border border-amber-900/60 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>EVAL: FORCED CONTAINER</span>
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setStep(3)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                step === 3
                  ? "bg-zinc-900 border-cyan-500 shadow-md"
                  : "bg-[#0d0e14] border-zinc-800 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 font-mono text-xs font-bold text-cyan-400 flex items-center justify-center">
                  03
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Encrypted Wrapper</span>
              </div>
              <h3 className="font-bold text-sm text-white mb-1">.sevr Container Release</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                AES-256 GCM encrypted file wrapped with cryptographic provenance header and expiration lease.
              </p>
              <div className="mt-4 p-2 bg-[#090a0f] rounded font-mono text-[11px] text-cyan-400 border border-cyan-900/60 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>genome_sample_A1.sevr</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2D SVG Cryptographic Hash Chain Audit Timeline */}
        <section id="hash-chain" className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Immutable Integrity Audit
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                2D Cryptographic SHA-256 Hash Chain Visualizer
              </h2>
            </div>

            <button
              onClick={() => setHashSimulated(!hashSimulated)}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-emerald-400 rounded-lg border border-zinc-800 transition flex items-center gap-2 self-start"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${hashSimulated ? "" : "animate-spin"}`} />
              <span>Simulate Block Verification</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* SVG Linked Blocks Timeline */}
            <div className="p-6 rounded-2xl bg-[#0d0e14] border border-zinc-800 space-y-4 font-mono text-xs overflow-x-auto">
              {/* Block 1 */}
              <div className="flex items-center gap-4 min-w-[600px]">
                <div className="w-24 p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-center font-bold text-zinc-300">
                  Block #101
                </div>
                <div className="flex-1 p-3 bg-zinc-900/80 rounded-lg border border-zinc-800 space-y-1">
                  <div className="text-[10px] text-zinc-400">Action: FILE_UPLOAD (genome_data.csv)</div>
                  <div className="text-emerald-400 text-[11px]">
                    Hash: 8f9b2a1c4e7d3f0a5b8c2d9e1f4a7b3c...
                  </div>
                </div>
                <span className="px-2 py-1 bg-zinc-900 text-emerald-400 border border-zinc-800 text-[10px] font-bold rounded">
                  VERIFIED
                </span>
              </div>

              {/* Connecting Line */}
              <div className="pl-12 text-zinc-500 flex items-center gap-2 text-[10px]">
                <div className="w-0.5 h-6 bg-zinc-700 ml-2.5" />
                <span className="text-zinc-500 font-mono">Linked via previousHash pointer</span>
              </div>

              {/* Block 2 */}
              <div className="flex items-center gap-4 min-w-[600px]">
                <div className="w-24 p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-center font-bold text-zinc-300">
                  Block #102
                </div>
                <div className="flex-1 p-3 bg-zinc-900/80 rounded-lg border border-zinc-800 space-y-1">
                  <div className="text-[10px] text-zinc-400">Action: TLP_UPDATE (CLEAR -&gt; AMBER)</div>
                  <div className="text-amber-400 text-[11px]">
                    Hash: 3c7a1b4f9d2e8c0f5b3a6d9e1f2a4b8c...
                  </div>
                  <div className="text-[10px] text-zinc-500">PrevHash: 8f9b2a1c4e7d3f0a5b8c2d9e1f4a7b3c...</div>
                </div>
                <span className="px-2 py-1 bg-zinc-900 text-emerald-400 border border-zinc-800 text-[10px] font-bold rounded">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ShowcaseFooter />
    </div>
  );
}
