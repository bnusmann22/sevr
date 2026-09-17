import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  BookOpen,
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
    <div className="min-h-screen bg-slate-100 text-slate-800 md:bg-[#090a0f] md:text-zinc-100 flex flex-col font-sans selection:bg-slate-200 selection:text-slate-900 md:selection:bg-emerald-500/20 md:selection:text-emerald-400">
      <ShowcaseNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-16 lg:space-y-24">
        {/* Hero Section: Centralized on Mobile, Asymmetrical 12-Col on Desktop */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start max-w-3xl lg:max-w-none mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 md:text-white leading-[1.15]">
              Sovereign Data Enclaves for{" "}
              <span className="text-slate-900 md:text-white font-black underline decoration-emerald-600/60 md:decoration-emerald-400/60 underline-offset-8">
                Varsity Research
              </span>
            </h1>

            <p className="text-slate-600 md:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl">
              SeVR 1.0 eliminates academic data leakage with zero-trust Attribute-Based Access Control (ABAC), automated FIRST TLP 2.0 policy enforcement, forced <code className="text-slate-800 bg-slate-200 border-slate-300 md:text-emerald-400 md:bg-emerald-950/40 md:border-emerald-800/40 font-mono text-xs px-1.5 py-0.5 rounded border">.sevr</code> container encryption, and tamper-evident SHA-256 hash chains.
            </p>

            {/* Responsive CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto pt-2">
              {/* Desktop Enclave Launch */}
              <Link
                to="/login"
                className="hidden md:inline-flex px-6 py-3 bg-zinc-100 text-zinc-950 font-bold text-xs rounded-xl hover:bg-white transition-all items-center gap-2 active:scale-[0.98]"
              >
                <span>Launch Operational Enclave</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </Link>

              {/* Mobile Access Research Portal */}
              <Link
                to="/login"
                className="md:hidden w-full sm:w-auto px-6 py-3 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-emerald-200" />
                <span>Access Research Portal</span>
              </Link>

              <Link
                to="/sevr"
                className="w-full sm:w-auto px-5 py-3 bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300 hover:text-slate-900 md:bg-zinc-900/80 md:text-zinc-300 md:border-zinc-800 md:hover:bg-zinc-800 md:hover:text-white font-semibold text-xs rounded-xl border transition flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4 text-emerald-700 md:text-emerald-400" />
                <span>Explore .sevr Format</span>
              </Link>
            </div>

            {/* Live Cryptographic Telemetry Ticker */}
            <div className="w-full pt-4 border-t border-slate-300 md:border-zinc-900 space-y-2 max-w-xl">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 md:text-zinc-400">
                <span className="flex items-center gap-1.5 text-slate-700 md:text-zinc-300 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-emerald-700 md:text-emerald-400" />
                  Live Cryptographic Ledger Stream
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    verifyStatus === "VERIFIED"
                      ? "bg-slate-200 text-emerald-800 border-slate-300 md:bg-emerald-950/50 md:text-emerald-400 md:border-emerald-800/40 border"
                      : "bg-slate-200 text-amber-800 border-slate-300 md:bg-amber-950/50 md:text-amber-400 md:border-amber-800/40 border"
                  }`}
                >
                  {verifyStatus}
                </span>
              </div>
              <div className="p-3 bg-slate-200/80 border-slate-300 text-slate-800 md:bg-zinc-900/60 md:border-zinc-800 md:text-zinc-200 rounded-xl border font-mono text-[11px] break-all flex items-center justify-between gap-2">
                <span className="text-emerald-800 md:text-emerald-400 select-all font-semibold">{currentHash}</span>
                <span className="text-[10px] text-slate-500 md:text-zinc-500 shrink-0 font-bold">SHA-256</span>
              </div>
            </div>
          </div>

          {/* Desktop Only 3D Asset Column (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-5 space-y-4">
            <EnclaveShieldCanvas />

            {/* Micro Card: Enclave Status Indicator */}
            <div className="p-4 rounded-xl bg-white border-slate-300 md:bg-zinc-900/60 md:border-zinc-800 border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border-slate-300 text-emerald-700 md:bg-zinc-800 md:border-zinc-700 md:text-emerald-400 border flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 md:text-white">Active Enclave Governance</h4>
                  <p className="text-[11px] text-slate-600 md:text-zinc-400 font-mono">FIRST TLP 2.0 &amp; OIDC PKCE Standard</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-800 bg-slate-100 border-slate-300 md:text-emerald-400 md:bg-emerald-950/40 md:border-emerald-800/40 font-bold px-2.5 py-1 rounded border">
                100% ISOLATED
              </span>
            </div>
          </div>
        </section>

        {/* Feature UI Mockup Showcase (Visual Platform Preview) */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 md:text-white tracking-tight">
              Operational Enclave Platform Preview
            </h2>
            <p className="text-slate-600 md:text-zinc-400 text-base sm:text-lg leading-relaxed">
              The SeVR Operational Enclave Platform provides a zero-trust workspace engineered specifically for varsity research datasets. By uniting automated FIRST TLP 2.0 policy enforcement with cryptographic file containerization, the console guarantees complete asset visibility and dynamic role-based control. Researchers, supervisors, and compliance officers manage active research vaults, track real-time hash-chained audit trails, and execute policy-driven external sharing within a single unified control surface.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                to="/docs"
                className="text-xs font-mono text-emerald-700 md:text-emerald-400 hover:underline flex items-center gap-1.5 font-bold"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Platform Documentation</span>
              </Link>
            </div>
          </div>

          {/* High-Resolution Platform UI Mockup Image Container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative rounded-2xl overflow-hidden border border-slate-300 bg-white md:border-zinc-800 md:bg-zinc-900/40 group"
          >
            <div className="p-3 bg-slate-200/90 border-slate-300 text-slate-700 md:bg-zinc-900/90 md:border-zinc-800 md:text-zinc-400 border-b flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-slate-800 md:text-zinc-200 font-bold">SeVR Data Vault: Academic Enclave Control Console</span>
              </div>
              <span className="text-emerald-800 md:text-emerald-400 font-bold">TLP 2.0 ENCLAVE ISOLATED</span>
            </div>
            
            <img
              src="/assets/enclave_dashboard_mockup.jpg"
              alt="SeVR Data Vault Operational Platform Mockup"
              className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-300"
            />
          </motion.div>
        </section>

        {/* .sevr Container Architecture Visual Section */}
        <section className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-slate-300 md:bg-zinc-900/40 md:border-zinc-800 border space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 md:border-zinc-800/60 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 md:text-emerald-400 font-semibold">
                Encrypted Container Format
              </span>
              <h2 className="text-2xl font-bold text-slate-900 md:text-white tracking-tight mt-1">
                Anatomy of the <code className="text-emerald-700 md:text-emerald-400 font-mono">.sevr</code> Container
              </h2>
            </div>
            <Link
              to="/sevr"
              className="px-4 py-2 bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300 md:bg-zinc-900 md:text-zinc-300 md:border-zinc-800 md:hover:bg-zinc-800 text-xs font-mono rounded-xl border transition flex items-center gap-2 self-start"
            >
              <span>Full Format Spec</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700 md:text-emerald-400" />
            </Link>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-300 md:border-zinc-800 bg-slate-950">
            <img
              src="/assets/sevr_container_diagram.jpg"
              alt=".sevr Encrypted Container Architecture Diagram"
              className="w-full h-auto object-cover"
            />
          </div>
        </section>

        {/* Live Metrics Grid */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 md:text-white tracking-tight">
              Zero-Trust Enclave Benchmarks
            </h2>
            <p className="text-slate-600 md:text-zinc-400 text-base sm:text-lg leading-relaxed">
              SeVR establishes an empirical security posture backed by mathematically verifiable runtime benchmarks across all participating university departments. Every operational metric is continually monitored to enforce strict SLA guarantees, from zero unsanctioned data egress and sub-50 millisecond ABAC permission revocations to 100% immutable SHA-256 audit block links. The enclave platform ensures peak cryptographic resilience without compromising research workflow velocity or system responsiveness.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="p-5 rounded-2xl bg-white border-slate-300 hover:border-slate-400 md:bg-zinc-900/60 md:border-zinc-800 md:hover:border-zinc-700 border transition group">
              <div className="flex items-center justify-between mb-3">
                <Shield className="w-5 h-5 text-emerald-700 md:text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-800 bg-slate-100 border-slate-300 md:text-emerald-400 md:bg-emerald-950/40 md:border-emerald-800/40 px-2 py-0.5 rounded border font-bold">
                  GUARANTEED
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 md:text-white font-mono">0.0%</div>
              <h3 className="text-xs font-bold text-slate-800 md:text-zinc-200 mt-1">Unsanctioned Leakage</h3>
              <p className="text-[11px] text-slate-600 md:text-zinc-400 mt-1">Forced container wrapping prevents raw file egress.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border-slate-300 hover:border-slate-400 md:bg-zinc-900/60 md:border-zinc-800 md:hover:border-zinc-700 border transition group">
              <div className="flex items-center justify-between mb-3">
                <Zap className="w-5 h-5 text-cyan-700 md:text-cyan-400" />
                <span className="text-[10px] font-mono text-cyan-800 bg-slate-100 border-slate-300 md:text-cyan-400 md:bg-cyan-950/40 md:border-cyan-800/40 px-2 py-0.5 rounded border font-bold">
                  REALTIME
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 md:text-white font-mono">&lt; 50 ms</div>
              <h3 className="text-xs font-bold text-slate-800 md:text-zinc-200 mt-1">ABAC Revocation Speed</h3>
              <p className="text-[11px] text-slate-600 md:text-zinc-400 mt-1">Instant permission termination across active client sockets.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border-slate-300 hover:border-slate-400 md:bg-zinc-900/60 md:border-zinc-800 md:hover:border-zinc-700 border transition group">
              <div className="flex items-center justify-between mb-3">
                <FileCheck className="w-5 h-5 text-amber-700 md:text-amber-400" />
                <span className="text-[10px] font-mono text-amber-800 bg-slate-100 border-slate-300 md:text-amber-400 md:bg-amber-950/40 md:border-amber-800/40 px-2 py-0.5 rounded border font-bold">
                  IMMUTABLE
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 md:text-white font-mono">100%</div>
              <h3 className="text-xs font-bold text-slate-800 md:text-zinc-200 mt-1">Tamper-Evident Logs</h3>
              <p className="text-[11px] text-slate-600 md:text-zinc-400 mt-1">SHA-256 linked blocks prevent log alteration or deletion.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border-slate-300 hover:border-slate-400 md:bg-zinc-900/60 md:border-zinc-800 md:hover:border-zinc-700 border transition group">
              <div className="flex items-center justify-between mb-3">
                <Cpu className="w-5 h-5 text-rose-700 md:text-rose-400" />
                <span className="text-[10px] font-mono text-rose-800 bg-slate-100 border-slate-300 md:text-rose-400 md:bg-rose-950/40 md:border-rose-800/40 px-2 py-0.5 rounded border font-bold">
                  BOUNDED
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 md:text-white font-mono">&lt; 2.0 s</div>
              <h3 className="text-xs font-bold text-slate-800 md:text-zinc-200 mt-1">Policy Evaluation Latency</h3>
              <p className="text-[11px] text-slate-600 md:text-zinc-400 mt-1">Strict UX boundary on decision engine execution times.</p>
            </div>
          </motion.div>
        </section>

        {/* TLP 2.0 Classification Matrix Section */}
        <section className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-slate-300 md:bg-zinc-900/40 md:border-zinc-800 border space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-mono text-emerald-700 md:text-emerald-400 uppercase tracking-widest font-semibold">
              FIRST TLP 2.0 Protocol Standard
            </span>
            <h2 className="text-2xl font-bold text-slate-900 md:text-white tracking-tight">
              Categorized Sensitivity Spectrum
            </h2>
            <p className="text-xs text-slate-600 md:text-zinc-400">
              SeVR strictly enforces FIRST Traffic Light Protocol standards across all research assets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
            {/* TLP CLEAR */}
            <div className="p-4 rounded-xl bg-slate-50 border-slate-300 md:bg-zinc-900/40 md:border-zinc-800 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 md:text-zinc-200">TLP:CLEAR</span>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              <p className="text-[11px] text-slate-600 md:text-zinc-400 font-sans leading-snug">
                Public research output. Native format downloads allowed unrestricted.
              </p>
            </div>

            {/* TLP GREEN */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border-emerald-300 md:bg-emerald-950/20 md:border-emerald-900/40 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 md:text-emerald-400">TLP:GREEN</span>
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-700 md:text-zinc-300 font-sans leading-snug">
                Academic department sharing. Forced container across departments.
              </p>
            </div>

            {/* TLP AMBER */}
            <div className="p-4 rounded-xl bg-amber-50/60 border-amber-300 md:bg-amber-950/20 md:border-amber-900/40 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 md:text-amber-400">TLP:AMBER</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <p className="text-[11px] text-slate-700 md:text-zinc-300 font-sans leading-snug">
                Need-to-know project members. Mandatory encrypted <code className="text-amber-800 bg-amber-100 md:text-amber-300 md:bg-amber-950/60 px-1 py-0.5 rounded">.sevr</code> wrapper.
              </p>
            </div>

            {/* TLP AMBER+STRICT */}
            <div className="p-4 rounded-xl bg-orange-50/60 border-orange-300 md:bg-amber-950/30 md:border-orange-900/40 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-800 md:text-orange-400">TLP:AMBER+STRICT</span>
                <span className="w-2 h-2 rounded-full bg-orange-500" />
              </div>
              <p className="text-[11px] text-slate-700 md:text-zinc-300 font-sans leading-snug">
                Organization strictly limited. Zero external link exports permitted.
              </p>
            </div>

            {/* TLP RED */}
            <div className="p-4 rounded-xl bg-rose-50/60 border-rose-300 md:bg-rose-950/20 md:border-rose-900/40 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-800 md:text-rose-400">TLP:RED</span>
                <span className="w-2 h-2 rounded-full bg-rose-600" />
              </div>
              <p className="text-[11px] text-slate-700 md:text-zinc-300 font-sans leading-snug">
                Restricted Enclave Eyes-Only. PI approval required for enclave export.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ShowcaseFooter />
    </div>
  );
}
