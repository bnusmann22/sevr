import { useState } from "react";
import ShowcaseNavbar from "../../components/showcase/ShowcaseNavbar";
import ShowcaseFooter from "../../components/showcase/ShowcaseFooter";
import {
  Shield,
  Lock,
  UserX,
  FileCheck,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";

export default function ShowcaseWorkflowsPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [supervisorApproved, setSupervisorApproved] = useState<boolean>(true);
  const [memberRevoked, setMemberRevoked] = useState<boolean>(false);
  const [anomalyTriggered, setAnomalyTriggered] = useState<boolean>(false);

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSupervisorApproved(true);
    setMemberRevoked(false);
    setAnomalyTriggered(false);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <ShowcaseNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Automated Policy Execution Engine</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Interactive Enclave Workflow Simulator
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Experience step-by-step how SeVR automates research file classification, PI approvals, instant ABAC permission revocations, and anomaly alert escalations.
          </p>
        </section>

        {/* Interactive Simulator Shell */}
        <section className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-8 backdrop-blur-md">
          {/* Step Timeline Ribbon */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-6 overflow-x-auto gap-4">
            {[
              { num: 1, label: "01. Upload & TLP Tag" },
              { num: 2, label: "02. Supervisor Approval" },
              { num: 3, label: "03. ABAC Revocation" },
              { num: 4, label: "04. Anomaly Alert" },
              { num: 5, label: "05. Expiring Share" },
            ].map((st) => (
              <button
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shrink-0 ${
                  currentStep === st.num
                    ? "bg-zinc-100 text-zinc-950 font-bold shadow-sm"
                    : currentStep > st.num
                    ? "bg-zinc-900 text-emerald-400 border border-zinc-800"
                    : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                }`}
              >
                <span>{st.label}</span>
              </button>
            ))}
          </div>

          {/* Active Step Canvas Surface */}
          <div className="p-8 rounded-2xl bg-[#0d0e14] border border-zinc-800 min-h-[320px] flex flex-col justify-between space-y-6">
            {/* Step 1: Upload & Auto TLP */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 text-emerald-400 border border-zinc-800 font-mono text-xs font-bold">
                    STEP 01
                  </span>
                  <h3 className="text-xl font-bold text-white">Researcher Upload &amp; Automatic TLP Tagging</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-xl font-sans">
                  A postgraduate researcher uploads <code className="text-emerald-400 font-mono">genomic_clinical_trial_v2.xlsx</code> into the department enclave workspace.
                </p>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 font-mono text-xs max-w-lg">
                  <div className="flex justify-between text-zinc-400">
                    <span>File Name:</span>
                    <span className="text-white">genomic_clinical_trial_v2.xlsx</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Size / Format:</span>
                    <span className="text-white">14.2 MB (XLSX)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Automatic Classification:</span>
                    <span className="text-amber-400 font-bold">TLP:AMBER</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Export Rule Applied:</span>
                    <span className="text-emerald-400 font-bold">FORCED .SEVR CONTAINER</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Supervisor Approval */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 text-amber-400 border border-zinc-800 font-mono text-xs font-bold">
                    STEP 02
                  </span>
                  <h3 className="text-xl font-bold text-white">Principal Investigator (PI) Approval Gate</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-xl font-sans">
                  For <code className="text-amber-400 font-mono">TLP:AMBER</code> assets, PI approval is required before un-containerized export override can be requested.
                </p>

                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between max-w-lg">
                  <div>
                    <h4 className="text-xs font-bold text-white">PI Approval Status</h4>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      {supervisorApproved ? "APPROVED (Prof. Ibrahim BUK)" : "PENDING SUPERVISOR REVIEW"}
                    </p>
                  </div>
                  <button
                    onClick={() => setSupervisorApproved(!supervisorApproved)}
                    className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
                      supervisorApproved
                        ? "bg-zinc-100 text-zinc-950"
                        : "bg-rose-950 text-rose-400 border border-rose-900"
                    }`}
                  >
                    {supervisorApproved ? "APPROVED" : "TOGGLE APPROVAL"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: ABAC Member Revocation */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 text-rose-400 border border-zinc-800 font-mono text-xs font-bold">
                    STEP 03
                  </span>
                  <h3 className="text-xl font-bold text-white">Instant ABAC Member Access Revocation</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-xl font-sans">
                  Clicking <strong className="text-rose-400 font-mono">"Revoke Member"</strong> instantly terminates user session keys across all active client sockets in under 50ms.
                </p>

                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between max-w-lg">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white">Researcher: Dr. Aliyu Sani</span>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Role: External Collaborator · Dept: Bio-Tech
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        memberRevoked
                          ? "bg-zinc-900 text-rose-400 border border-rose-900"
                          : "bg-zinc-900 text-emerald-400 border border-emerald-800"
                      }`}
                    >
                      {memberRevoked ? "ACCESS REVOKED (< 50ms)" : "ACTIVE MEMBER"}
                    </span>
                  </div>

                  <button
                    onClick={() => setMemberRevoked(!memberRevoked)}
                    className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition flex items-center gap-2 ${
                      memberRevoked
                        ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        : "bg-rose-600 text-white hover:bg-rose-500"
                    }`}
                  >
                    <UserX className="w-4 h-4" />
                    <span>{memberRevoked ? "RESTORE MEMBER" : "REVOKE MEMBER NOW"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Anomaly Alert */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 text-amber-400 border border-zinc-800 font-mono text-xs font-bold">
                    STEP 04
                  </span>
                  <h3 className="text-xl font-bold text-white">Mass-Download Anomaly Trigger</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-xl font-sans">
                  Detects off-hour rapid exports or abnormal bulk access patterns, triggering automated containment.
                </p>

                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between max-w-lg">
                  <div>
                    <h4 className="text-xs font-bold text-white">Detector: MASS_DOWNLOAD_SPIKE</h4>
                    <p className="text-[11px] text-zinc-400 font-mono">Risk Score: 88/100 (HIGH RISK)</p>
                  </div>

                  <button
                    onClick={() => setAnomalyTriggered(!anomalyTriggered)}
                    className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition flex items-center gap-2 ${
                      anomalyTriggered
                        ? "bg-amber-500 text-zinc-950"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>{anomalyTriggered ? "ALERT ESCALATED" : "SIMULATE ANOMALY SPIKE"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Expiring Share Link */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 text-cyan-400 border border-zinc-800 font-mono text-xs font-bold">
                    STEP 05
                  </span>
                  <h3 className="text-xl font-bold text-white">Scoped External Link Expiration</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-xl font-sans">
                  Signed external download portal links automatically expire based on mandatory lease times.
                </p>

                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 font-mono text-xs max-w-lg">
                  <div className="flex justify-between text-zinc-400">
                    <span>Share Token Link:</span>
                    <span className="text-cyan-400">/share/9f86d081884c7d65</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Lease Expiration Countdown:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      59m 59s
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono rounded-xl border border-zinc-800 transition flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulation</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentStep === 5}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>{currentStep === 5 ? "Simulation Completed" : "Next Workflow Step"}</span>
                <Play className="w-3.5 h-3.5 text-zinc-950 fill-current" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <ShowcaseFooter />
    </div>
  );
}
