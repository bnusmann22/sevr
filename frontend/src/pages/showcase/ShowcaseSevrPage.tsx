import { useState } from "react";
import ShowcaseNavbar from "../../components/showcase/ShowcaseNavbar";
import ShowcaseFooter from "../../components/showcase/ShowcaseFooter";
import {
  Layers,
  Lock,
  FileCheck,
  Shield,
  CheckCircle2,
  Cpu,
  Key,
  Database,
  ArrowRight,
  Terminal,
  Clock,
  Zap,
} from "lucide-react";

export default function ShowcaseSevrPage() {
  const [inspectorMode, setInspectorMode] = useState<"raw" | "sevr">("sevr");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 md:bg-[#090a0f] md:text-zinc-100 flex flex-col font-sans selection:bg-slate-200 selection:text-slate-900 md:selection:bg-zinc-800 md:selection:text-zinc-100">
      <ShowcaseNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-700 bg-slate-200 border-slate-300 md:text-emerald-400 md:bg-zinc-900 md:border-zinc-800 px-3 py-1.5 rounded-full border">
            <Layers className="w-4 h-4 text-emerald-700 md:text-emerald-400" />
            <span>Encrypted Research Container Specification</span>
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 md:text-white tracking-tight sm:text-5xl">
            The <code className="text-emerald-700 md:text-emerald-400 font-mono">.sevr</code> Container Format
          </h1>

          <p className="text-slate-600 md:text-zinc-400 text-sm sm:text-base leading-relaxed">
            A self-contained, cryptographically wrapped file format designed to prevent academic research data leakage by embedding access policy rules, expiration leases, and SHA-256 provenance directly inside the file header.
          </p>
        </section>

        {/* Visual Binary Envelope Breakdown */}
        <section className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-slate-300 md:bg-zinc-900/60 md:border-zinc-800 border space-y-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 md:border-zinc-800 pb-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 md:text-emerald-400 font-semibold">
                Binary Architecture Specification
              </span>
              <h2 className="text-2xl font-bold text-slate-900 md:text-white tracking-tight mt-1">
                Anatomy of a <code className="text-emerald-700 md:text-emerald-400 font-mono">.sevr</code> File
              </h2>
            </div>
            <p className="text-xs text-slate-600 md:text-zinc-400 max-w-md">
              Every exported research asset is wrapped with a 4-part cryptographic envelope before leaving the enclave.
            </p>
          </div>

          {/* High-Res Visual Architecture Diagram Image */}
          <div className="rounded-2xl overflow-hidden border border-slate-300 md:border-zinc-800 bg-[#0d0e14]">
            <img
              src="/assets/sevr_container_diagram.jpg"
              alt=".sevr Encrypted Container Architecture Diagram"
              className="w-full h-auto object-cover opacity-95 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* 4-Part Container Visual Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            {/* Part 1: Magic Header */}
            <div className="p-5 rounded-2xl bg-slate-50 border-slate-300 md:bg-[#0d0e14] md:border-zinc-800 border space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-slate-200 text-emerald-800 border-slate-300 md:bg-zinc-800 md:text-emerald-400 md:border-zinc-700 border text-xs font-bold flex items-center justify-center">
                  01
                </span>
                <span className="text-[10px] text-slate-500 md:text-zinc-500 uppercase font-semibold">4 Bytes</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 md:text-white">Magic Identifier</h3>
              <p className="text-slate-600 md:text-zinc-400 font-sans text-xs leading-relaxed">
                Binary signature identifying the file as an authentic SeVR enclave container.
              </p>
              <div className="p-2.5 bg-slate-200/80 border-slate-300 text-emerald-800 md:bg-zinc-900 md:border-zinc-800 md:text-emerald-400 border rounded font-mono text-[11px]">
                0x53 0x65 0x56 0x52 <span className="text-slate-500 md:text-zinc-500">("SeVR")</span>
              </div>
            </div>

            {/* Part 2: Enclave Header Envelope */}
            <div className="p-5 rounded-2xl bg-slate-50 border-slate-300 md:bg-[#0d0e14] md:border-zinc-800 border space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-slate-200 text-amber-800 border-slate-300 md:bg-zinc-800 md:text-amber-400 md:border-zinc-700 border text-xs font-bold flex items-center justify-center">
                  02
                </span>
                <span className="text-[10px] text-slate-500 md:text-zinc-500 uppercase font-semibold">Metadata Header</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 md:text-white">Policy Envelope</h3>
              <p className="text-slate-600 md:text-zinc-400 font-sans text-xs leading-relaxed">
                Embeds TLP 2.0 level, origin department, SHA-256 hash, and expiration lease.
              </p>
              <div className="p-2.5 bg-slate-200/80 border-slate-300 text-amber-800 md:bg-zinc-900 md:border-zinc-800 md:text-amber-400 border rounded font-mono text-[11px]">
                TLP:AMBER | DEPT:BIO | EXP:24h
              </div>
            </div>

            {/* Part 3: Encrypted Payload */}
            <div className="p-5 rounded-2xl bg-slate-50 border-slate-300 md:bg-[#0d0e14] md:border-zinc-800 border space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-slate-200 text-cyan-800 border-slate-300 md:bg-zinc-800 md:text-cyan-400 md:border-zinc-700 border text-xs font-bold flex items-center justify-center">
                  03
                </span>
                <span className="text-[10px] text-slate-500 md:text-zinc-500 uppercase font-semibold">AES-256 GCM</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 md:text-white">Encrypted Payload</h3>
              <p className="text-slate-600 md:text-zinc-400 font-sans text-xs leading-relaxed">
                Original research dataset chunked &amp; encrypted via authenticated AES-256 GCM.
              </p>
              <div className="p-2.5 bg-slate-200/80 border-slate-300 text-cyan-800 md:bg-zinc-900 md:border-zinc-800 md:text-cyan-400 border rounded font-mono text-[11px] truncate">
                c8f2a1e9b4d3701f...
              </div>
            </div>

            {/* Part 4: HMAC Provenance */}
            <div className="p-5 rounded-2xl bg-slate-50 border-slate-300 md:bg-[#0d0e14] md:border-zinc-800 border space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-slate-200 text-rose-800 border-slate-300 md:bg-zinc-800 md:text-rose-400 md:border-zinc-700 border text-xs font-bold flex items-center justify-center">
                  04
                </span>
                <span className="text-[10px] text-slate-500 md:text-zinc-500 uppercase font-semibold">SHA-256 HMAC</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 md:text-white">HMAC Signature</h3>
              <p className="text-slate-600 md:text-zinc-400 font-sans text-xs leading-relaxed">
                Cryptographic integrity signature preventing header or payload tampering.
              </p>
              <div className="p-2.5 bg-slate-200/80 border-slate-300 text-rose-800 md:bg-zinc-900 md:border-zinc-800 md:text-rose-400 border rounded font-mono text-[11px] truncate">
                e3b0c44298fc1c14...
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Binary Container Inspector */}
        <section className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-slate-300 md:bg-zinc-900/60 md:border-zinc-800 border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 md:border-zinc-800 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 md:text-emerald-400 font-semibold">
                Interactive Format Inspector
              </span>
              <h2 className="text-2xl font-bold text-slate-900 md:text-white tracking-tight mt-1">
                Native File vs <code className="text-emerald-700 md:text-emerald-400 font-mono">.sevr</code> Container
              </h2>
            </div>

            {/* Inspector Mode Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-200 border-slate-300 md:bg-zinc-900 md:border-zinc-800 border p-1 rounded-xl font-mono text-xs">
              <button
                onClick={() => setInspectorMode("raw")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  inspectorMode === "raw"
                    ? "bg-white text-slate-900 border border-slate-300 md:bg-zinc-800 md:text-white"
                    : "text-slate-600 hover:text-slate-900 md:text-zinc-400 md:hover:text-white"
                }`}
              >
                Native Raw CSV
              </button>
              <button
                onClick={() => setInspectorMode("sevr")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  inspectorMode === "sevr"
                    ? "bg-emerald-700 text-white md:bg-emerald-500 md:text-zinc-950"
                    : "text-slate-600 hover:text-slate-900 md:text-zinc-400 md:hover:text-white"
                }`}
              >
                Wrapped .sevr Container
              </button>
            </div>
          </div>

          {/* Live Code/Hex Preview Window */}
          <div className="p-6 rounded-2xl bg-slate-50 border-slate-300 md:bg-[#0d0e14] md:border-zinc-800 border font-mono text-xs space-y-4">
            <div className="flex items-center justify-between text-slate-600 border-slate-200 md:text-zinc-400 md:border-zinc-800/80 border-b pb-3 text-[11px]">
              <span className="flex items-center gap-2 font-semibold">
                <Terminal className="w-4 h-4 text-emerald-700 md:text-emerald-400" />
                <span>Payload Inspector: {inspectorMode === "raw" ? "raw_dataset.csv" : "raw_dataset.sevr"}</span>
              </span>
              <span className="text-slate-500 md:text-zinc-500 font-bold">
                {inspectorMode === "raw" ? "UNPROTECTED PLAIN TEXT" : "AES-256 GCM ENCRYPTED"}
              </span>
            </div>

            {inspectorMode === "raw" ? (
              <pre className="text-slate-800 bg-white border-slate-300 md:text-zinc-300 md:bg-zinc-900/50 md:border-zinc-800 border leading-relaxed overflow-x-auto text-[11px] p-4 rounded-xl">
{`sample_id,patient_dna_sequence,tlp_classification,access_role
001,ATCGGACTAGCTAGCTAGCTA,CLEAR,researcher
002,GCTAGCTAGCTAGCTAGCTA,AMBER,pi_only
003,TAGCTAGCTAGCTAGCTAGC,RED,restricted_enclave`}
              </pre>
            ) : (
              <div className="space-y-3">
                <pre className="text-emerald-800 bg-white border-slate-300 md:text-emerald-400 md:bg-zinc-900/50 md:border-zinc-800 border leading-relaxed overflow-x-auto text-[11px] p-4 rounded-xl font-bold md:font-normal">
{`[HEADER_MAGIC]: 53 65 56 52 (SeVR v1.0)
[TLP_POLICY]  : TLP:AMBER (Need-to-Know Organization)
[DEPT_CLAIM]  : Bayero University Kano - BioTech Enclave
[SHA256_HASH] : e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
[EXPIRATION]  : 2026-09-18T14:00:00Z (24h Lease)

[ENCRYPTED_PAYLOAD_CHUNKS (AES-256 GCM)]
00000000: 4a8f 2e91 c50b 82a1 93f7 1e42 d018 7b3e  J........B..{>
00000010: a9f4 81c2 3d70 5e61 b8d9 20f1 64e2 c90a  ....=p^a.. .d...
00000020: 71b3 c8e0 4f52 9d1b e2a4 87c1 30f9 6e52  q...OR......0.nR

[HMAC_PROVENANCE_SIGNATURE]: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f (VERIFIED)`}
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Feature Capabilities Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border-slate-300 md:bg-zinc-900/60 md:border-zinc-800 border space-y-3">
            <Lock className="w-6 h-6 text-emerald-700 md:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 md:text-white">Self-Contained Access Control</h3>
            <p className="text-xs text-slate-600 md:text-zinc-400 leading-relaxed">
              Access rules are embedded directly within the container header, eliminating dependency on third-party cloud file permissions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border-slate-300 md:bg-zinc-900/60 md:border-zinc-800 border space-y-3">
            <Clock className="w-6 h-6 text-amber-700 md:text-amber-400" />
            <h3 className="text-base font-bold text-slate-900 md:text-white">Auto-Expiring Decryption Lease</h3>
            <p className="text-xs text-slate-600 md:text-zinc-400 leading-relaxed">
              Containers enforce explicit cryptographic lease deadlines, automatically revoking local decryption rights after expiration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border-slate-300 md:bg-zinc-900/60 md:border-zinc-800 border space-y-3">
            <FileCheck className="w-6 h-6 text-cyan-700 md:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 md:text-white">Tamper-Evident SHA-256 Provenance</h3>
            <p className="text-xs text-slate-600 md:text-zinc-400 leading-relaxed">
              Any attempt to alter the file payload or header invalidates the SHA-256 HMAC provenance signature instantly.
            </p>
          </div>
        </section>
      </main>

      <ShowcaseFooter />
    </div>
  );
}
