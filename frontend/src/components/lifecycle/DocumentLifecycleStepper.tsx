import { useState } from "react";
import { Check, Clock, ChevronRight, ShieldAlert, FileText, ArrowRight } from "lucide-react";
import type { DocumentLifecycleState } from "../../types";

interface Props {
  currentState: DocumentLifecycleState;
  onTransition?: (targetState: DocumentLifecycleState, note?: string) => Promise<void>;
  isSupervisor?: boolean;
}

const STAGES: { id: DocumentLifecycleState; label: string; desc: string }[] = [
  { id: "DRAFT", label: "Draft", desc: "Initial document upload" },
  { id: "IN_REVIEW", label: "In Review", desc: "Peer review & annotations" },
  { id: "TLP_EVALUATED", label: "TLP Classified", desc: "Security policy assigned" },
  { id: "RELEASE_PENDING", label: "Release Pending", desc: "Supervisor sign-off queue" },
  { id: "RELEASED", label: "Released", desc: "Authorized for egress" },
];

export default function DocumentLifecycleStepper({ currentState, onTransition, isSupervisor }: Props) {
  const [transitioning, setTransitioning] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [targetState, setTargetState] = useState<DocumentLifecycleState | null>(null);
  const [reasonNote, setReasonNote] = useState("");

  const currentIndex = STAGES.findIndex((s) => s.id === currentState);

  const handleStageClick = (target: DocumentLifecycleState) => {
    if (!onTransition || transitioning) return;
    const targetIdx = STAGES.findIndex((s) => s.id === target);
    if (targetIdx <= currentIndex) return; // Cannot move backward directly

    if (target === "RELEASED" || target === "RELEASE_PENDING") {
      setTargetState(target);
      setShowNoteModal(true);
    } else {
      executeTransition(target);
    }
  };

  const executeTransition = async (target: DocumentLifecycleState, note?: string) => {
    if (!onTransition) return;
    setTransitioning(true);
    try {
      await onTransition(target, note);
    } finally {
      setTransitioning(false);
      setShowNoteModal(false);
      setReasonNote("");
      setTargetState(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <FileText className="h-4 w-4 text-emerald-600" />
          Document Lifecycle State Machine
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <Clock className="h-3 w-3" />
          Active State: {STAGES.find((s) => s.id === currentState)?.label}
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={stage.id} className="relative flex flex-1 items-center">
              <div
                onClick={() => isUpcoming && handleStageClick(stage.id)}
                className={`group flex w-full flex-col items-center rounded-lg p-2.5 transition ${
                  isCurrent
                    ? "bg-emerald-50 border border-emerald-200"
                    : isUpcoming
                    ? "cursor-pointer hover:bg-slate-50"
                    : "opacity-80"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-emerald-700 text-white ring-4 ring-emerald-100"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`mt-2 text-xs font-semibold ${isCurrent ? "text-emerald-900" : "text-slate-700"}`}>
                  {stage.label}
                </span>
                <span className="text-[10px] text-slate-400">{stage.desc}</span>
              </div>

              {index < STAGES.length - 1 && (
                <ChevronRight className="hidden h-4 w-4 text-slate-300 md:block" />
              )}
            </div>
          );
        })}
      </div>

      {/* Next State Transition Helper */}
      {currentIndex < STAGES.length - 1 && onTransition && (
        <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            disabled={transitioning}
            onClick={() => handleStageClick(STAGES[currentIndex + 1].id)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            Advance to {STAGES[currentIndex + 1].label}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Supervisor Justification Modal */}
      {showNoteModal && targetState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-2 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
              <h4 className="text-sm font-bold text-slate-900">
                Supervisor Approval Note Required
              </h4>
            </div>
            <p className="mb-3 text-xs text-slate-600">
              Moving this document to <span className="font-semibold text-slate-900">{targetState}</span> requires recording an architectural approval note in the immutable audit ledger.
            </p>

            <textarea
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              placeholder="e.g. Approved for patent attorney review prior to filing..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reasonNote.trim() || transitioning}
                onClick={() => executeTransition(targetState, reasonNote)}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Submit &amp; Transition State
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
