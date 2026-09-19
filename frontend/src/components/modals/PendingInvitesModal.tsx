import { useEffect, useState } from "react";
import { CheckCircle2, Shield, X, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { invitationsApi } from "../../api/services";
import type { ProjectInvitation } from "../../types";
import TlpBadge from "../tlp/TlpBadge";

type PendingInvitesModalProps = {
  onInvitationsChanged?: () => void;
};

export default function PendingInvitesModal({ onInvitationsChanged }: PendingInvitesModalProps) {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const checkPending = async () => {
    try {
      setLoading(true);
      const data = await invitationsApi.listPendingForMe();
      setInvitations(data.filter((i) => i.status === "pending"));
    } catch {
      // Gracefully ignore if offline or mock unavailable
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPending();
  }, []);

  if (dismissed || invitations.length === 0 || loading) {
    return null;
  }

  const handleAccept = async (id: string) => {
    setActionInProgress(id);
    setMessage("");
    try {
      await invitationsApi.accept(id);
      setMessage("Successfully joined the research enclave!");
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      window.dispatchEvent(new CustomEvent("sevr:projects-changed"));
      onInvitationsChanged?.();
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Unable to accept invitation at this time.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDecline = async (id: string) => {
    setActionInProgress(id);
    setMessage("");
    try {
      await invitationsApi.decline(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      onInvitationsChanged?.();
    } catch {
      setMessage("Unable to decline invitation.");
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-invites-title"
        className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-7"
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 id="pending-invites-title" className="text-base font-bold text-slate-900">
                Project Collaboration Invitations
              </h2>
              <p className="text-xs text-slate-500">
                You have {invitations.length} pending varsity research enclave invitation{invitations.length > 1 ? "s" : ""}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss invitations modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs text-teal-900">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  {inv.projectName || "Research Enclave"}
                </h3>
                {inv.defaultTlp && <TlpBadge label={inv.defaultTlp} />}
              </div>

              {inv.projectDescription && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                  {inv.projectDescription}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Invited by:{" "}
                  <strong className="font-semibold text-slate-700">
                    {inv.inviterName || inv.inviterEmail || "Supervisor"}
                  </strong>
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {new Date(inv.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-200/60 pt-3">
                <button
                  id="decline-invite-btn"
                  type="button"
                  disabled={actionInProgress === inv.id}
                  onClick={() => handleDecline(inv.id)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Decline
                </button>

                <button
                  id="accept-invite-btn"
                  type="button"
                  disabled={actionInProgress === inv.id}
                  onClick={() => handleAccept(inv.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {actionInProgress === inv.id ? "Joining..." : "Accept Invitation"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1 text-slate-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Unanswered invitations remain in your notification bell.
          </span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="font-semibold text-slate-700 hover:text-slate-900"
          >
            Review Later
          </button>
        </div>
      </div>
    </div>
  );
}
