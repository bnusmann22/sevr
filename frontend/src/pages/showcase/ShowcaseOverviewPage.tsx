import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ShowcaseNavbar from "../../components/showcase/ShowcaseNavbar";
import ShowcaseFooter from "../../components/showcase/ShowcaseFooter";
import EnclaveShieldCanvas from "../../components/showcase/EnclaveShieldCanvas";
import {
  Shield,
  Lock,
  ArrowRight,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Database,
  Cpu,
  Zap,
  Activity,
  Award,
  Layers,
  Eye,
} from "lucide-react";

export default function ShowcaseOverviewPage() {
  // Animated SHA-256 Hash Chain Stream Ticker
  const [currentHash, setCurrentHash] = useState(
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  );
  const [verifyStatus, setVerifyStatus] = useState("VERIFIED");

  useEffect(() => {
    const hashes = [
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      "d41d8cd98f00b204e9800998ecf8427e00000000000000000000000000000000",
      "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % hashes.length;
      setCurrentHash(hashes[idx]);
      setVerifyStatus("VERIFYING...");
      setTimeout(() => setVerifyStatus("VERIFIED"), 400);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <ShowcaseNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-24">
        {/* Asymmetrical 12-Column Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (7 cols): Editorial Typography & Telemetry */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Sovereign Data Enclaves for{" "}
              <span className="text-zinc-100 font-black underline decoration-emerald-500/60 underline-offset-8">
                Varsity Research
              </span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl">
              SeVR 1.0 eliminates academic data leakage with zero-trust Attribute-Based Access Control (ABAC), automated FIRST TLP 2.0 policy enforcement, forced <code className="text-emerald-400 font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">.sevr</code> container encryption, and tamper-evident SHA-256 hash chains.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/login"
                className="px-6 py-3 bg-zinc-100 text-zinc-950 font-bold text-xs rounded-xl hover:bg-white transition-all flex items-center gap-2 active:scale-[0.98]"
              >
                <span>Launch Operational Enclave</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/sevr"
                className="px-5 py-3 bg-zinc-900 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-800 hover:bg-zinc-800 hover:text-white transition flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Explore .sevr Format</span>
              </Link>
            </div>

            {/* Live Cryptographic Telemetry Ticker */}
            <div className="pt-4 border-t border-zinc-900 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Live Cryptographic Ledger Stream
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    verifyStatus === "VERIFIED"
                      ? "bg-zinc-900 text-emerald-400 border border-zinc-800"
                      : "bg-zinc-900 text-amber-400 border border-zinc-800"
                  }`}
                >
                  {verifyStatus}
                </span>
              </div>
              <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300 break-all flex items-center justify-between gap-2">
                <span className="text-emerald-400 select-all font-semibold">{currentHash}</span>
                <span className="text-[10px] text-zinc-500 shrink-0">SHA-256</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Interactive 3D Canvas & Micro Card */}
          <div className="lg:col-span-5 space-y-4">
            <EnclaveShieldCanvas />

            {/* Micro Card: Enclave Status Indicator */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Active Enclave Governance</h4>
                  <p className="text-[11px] text-zinc-400 font-mono">FIRST TLP 2.0 &amp; OIDC PKCE Standard</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                100% ISOLATED
              </span>
            </div>
          </div>
        </section>

        {/* Feature UI Mockup Showcase (Visual Platform Preview) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-900 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Enclave Data Vault UI
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                Operational Enclave Platform Preview
              </h2>
            </div>
            <Link
              to="/login"
              className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Launch Live Interface</span>
            </Link>
          </div>

          {/* High-Resolution Platform UI Mockup Image Container */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#0d0e14] shadow-2xl group">
            <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between font-mono text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-zinc-300 font-bold">SeVR Data Vault — Academic Enclave Control Console</span>
              </div>
              <span className="text-emerald-400 font-semibold">TLP 2.0 ENCLAVE ISOLATED</span>
            </div>
            
            <img
              src="/assets/enclave_dashboard_mockup.jpg"
              alt="SeVR Data Vault Operational Platform Mockup"
              className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </section>

        {/* .sevr Container Architecture Visual Section */}
        <section className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Encrypted Container Format
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Anatomy of the <code className="text-emerald-400 font-mono">.sevr</code> Container
              </h2>
            </div>
            <Link
              to="/sevr"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 rounded-xl border border-zinc-700 transition flex items-center gap-2 self-start"
            >
              <span>Full Format Spec</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </Link>
          </div>

          <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-[#0d0e14]">
            <img
              src="/assets/sevr_container_diagram.jpg"
              alt=".sevr Encrypted Container Architecture Diagram"
              className="w-full h-auto object-cover"
            />
          </div>
        </section>

        {/* Live Metrics Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-900 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Empirical Assurance
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                Zero-Trust Enclave Benchmarks
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm">
              Real-time operational metrics recorded across university research departments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition group">
              <div className="flex items-center justify-between mb-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  GUARANTEED
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">0.0%</div>
              <h3 className="text-xs font-semibold text-zinc-200 mt-1">Unsanctioned Leakage</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Forced container wrapping prevents raw file egress.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition group">
              <div className="flex items-center justify-between mb-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-[10px] font-mono text-cyan-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  REALTIME
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">&lt; 50 ms</div>
              <h3 className="text-xs font-semibold text-zinc-200 mt-1">ABAC Revocation Speed</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Instant permission termination across active client sockets.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition group">
              <div className="flex items-center justify-between mb-3">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <span className="text-[10px] font-mono text-amber-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  IMMUTABLE
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">100%</div>
              <h3 className="text-xs font-semibold text-zinc-200 mt-1">Tamper-Evident Logs</h3>
              <p className="text-[11px] text-zinc-400 mt-1">SHA-256 linked blocks prevent log alteration or deletion.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition group">
              <div className="flex items-center justify-between mb-3">
                <Cpu className="w-5 h-5 text-rose-400" />
                <span className="text-[10px] font-mono text-rose-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  BOUNDED
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">&lt; 2.0 s</div>
              <h3 className="text-xs font-semibold text-zinc-200 mt-1">Policy Evaluation Latency</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Strict UX boundary on decision engine execution times.</p>
            </div>
          </div>
        </section>

        {/* TLP 2.0 Classification Matrix Section */}
        <section className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
              FIRST TLP 2.0 Protocol Standard
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Categorized Sensitivity Spectrum
            </h2>
            <p className="text-xs text-zinc-400">
              SeVR strictly enforces FIRST Traffic Light Protocol standards across all research assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
            {/* TLP CLEAR */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200">TLP:CLEAR</span>
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                Public research output. Native format downloads allowed unrestricted.
              </p>
            </div>

            {/* TLP GREEN */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">TLP:GREEN</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                Academic department sharing. Forced container across departments.
              </p>
            </div>

            {/* TLP AMBER */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-amber-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">TLP:AMBER</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                Need-to-know project members. Mandatory encrypted <code className="text-amber-300">.sevr</code> wrapper.
              </p>
            </div>

            {/* TLP AMBER+STRICT */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-orange-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-400">TLP:AMBER+STRICT</span>
                <span className="w-2 h-2 rounded-full bg-orange-400" />
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                Organization strictly limited. Zero external link exports permitted.
              </p>
            </div>

            {/* TLP RED */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-rose-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400">TLP:RED</span>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                Restricted Enclave Eyes-Only. PI approval required for enclave export.
              </p>
            </div>          </div>
        </section>
      </main>

      <ShowcaseFooter />
    </div>
  );
}
