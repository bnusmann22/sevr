import { FormEvent, useEffect, useState } from "react";
import { membersApi, invitationsApi, type ProjectMember } from "../../api/services";
import { readAuthSession } from "../../pages/LoginPage";
import {
  UserPlus,
  UserX,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  Mail,
  Shield,
} from "lucide-react";
import type { ProjectInvitation } from "../../types";

const ROLE_OPTIONS = ["Viewer", "Researcher", "Co-Investigator", "Supervisor"];

export default function MemberList({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("Researcher");
  const [message, setMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");

  const session = readAuthSession();
  const canManage = ["supervisor", "institution_admin", "system_admin"].includes(
    session?.role ?? ""
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [membersData, invitationsData] = await Promise.all([
        membersApi.list(projectId),
        invitationsApi.listForProject(projectId).catch(() => [] as ProjectInvitation[]),
      ]);
      setMembers(membersData);
      setInvitations(invitationsData.filter((i) => i.status === "pending"));
    } catch {
      setError("Unable to load enclave membership roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const INSTITUTION_EMAIL_PATTERN = /^[^\s@]+@(?:[a-z0-9-]+\.)*(?:edu\.ng|edu)$/i;

  const invite = async (event: FormEvent) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!INSTITUTION_EMAIL_PATTERN.test(cleanEmail)) {
      setWarningMessage("Only verified institutional email addresses (@*.edu.ng or @*.edu) are permitted.");
      return;
    }

    setInviting(true);
    setMessage("");
    setWarningMessage("");
    setError("");

    try {
      await invitationsApi.create(projectId, {
        email: cleanEmail,
        role: selectedRole,
      });
      setMessage(`Invitation successfully dispatched to ${cleanEmail}.`);
      setEmail("");
      loadData();
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.response?.data?.message;

      if (status === 404) {
        setWarningMessage(
          `User ${cleanEmail} was not found in the enclave registry. Please contact the System Administrator to provision their profile first.`
        );
      } else if (detail) {
        setWarningMessage(detail);
      } else {
        setWarningMessage("Unable to dispatch invitation. Please check the institutional directory.");
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setUpdatingRoleId(memberId);
    try {
      const updated = await membersApi.updateRole(projectId, memberId, newRole);
      setMembers((current) => current.map((m) => (m.id === memberId ? updated : m)));
      setMessage(`Role updated to ${newRole} for ${updated.email}.`);
    } catch {
      setError("Unable to change member role.");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const revoke = async (memberId: string) => {
    setRevokingId(memberId);
    try {
      const updated = await membersApi.revoke(projectId, memberId);
      setMembers((current) => current.map((m) => (m.id === memberId ? updated : m)));
      setMessage("Member access has been revoked immediately under ABAC policy.");
    } catch {
      setError("Unable to revoke this member.");
    } finally {
      setRevokingId(null);
    }
  };

  const leaveProject = async () => {
    if (!window.confirm("Are you sure you want to voluntarily leave this research enclave?")) {
      return;
    }
    setLeaving(true);
    try {
      await membersApi.leave(projectId);
      setMessage("You have successfully left this research enclave.");
      window.dispatchEvent(new CustomEvent("sevr:projects-changed"));
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Unable to leave the project.");
    } finally {
      setLeaving(false);
    }
  };

  // Check if current user is an active member
  const currentMember = members.find(
    (m) => m.email.toLowerCase() === session?.email?.toLowerCase() && m.status === "active"
  );
  // Don't show leave button if sole supervisor or not in project
  const canLeave =
    Boolean(currentMember) &&
    (members.filter((m) => m.role === "Supervisor" && m.status === "active").length > 1 ||
      currentMember?.role !== "Supervisor");

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Enclave Membership &amp; Access Governance
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {canManage
              ? "Supervisors can dispatch collaborator invitations, adjust ABAC access roles, or revoke enclave credentials."
              : "Enclave access roster governed under institution Zero-Trust policy."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canLeave && (
            <button
              type="button"
              disabled={leaving}
              onClick={leaveProject}
              className="flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            >
              <LogOut className="h-3 w-3" />
              {leaving ? "Leaving..." : "Leave Project"}
            </button>
          )}

          <button
            type="button"
            onClick={loadData}
            className="flex items-center gap-1 border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Invite Member Form */}
      {canManage && (
        <form onSubmit={invite} className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="invite-email">
            Member institutional email
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@institution.edu"
            className="min-w-64 flex-1 border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
          />

          <select
            id="invite-role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            id="invite-submit-btn"
            type="submit"
            disabled={inviting || !email}
            className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {inviting ? "Dispatching..." : "Invite Collaborator"}
          </button>
        </form>
      )}

      {/* Alerts */}
      {message && (
        <div className="flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {warningMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>{warningMessage}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="font-semibold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <p role="status" className="text-xs text-slate-500">
          Loading enclave membership roster &amp; invitations...
        </p>
      )}

      {/* Active Enclave Members */}
      {!loading && (
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Enclave Collaborators ({members.filter((m) => m.status === "active").length})
            </h3>

            <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
              {members.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500">
                  No active members found in this enclave.
                </p>
              ) : (
                members.map((member) => {
                  const isActive = member.status === "active";
                  return (
                    <div key={member.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              member.role === "Supervisor"
                                ? "bg-purple-100 text-purple-800"
                                : member.role === "Co-Investigator"
                                ? "bg-teal-100 text-teal-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {member.email} · {member.department}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {isActive && canManage && (
                          <div className="flex items-center gap-1.5">
                            <label htmlFor={`role-${member.id}`} className="text-[11px] text-slate-500">
                              Access:
                            </label>
                            <select
                              id={`role-${member.id}`}
                              disabled={updatingRoleId === member.id}
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                            >
                              {ROLE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          {isActive ? (
                            canManage ? (
                              <button
                                type="button"
                                onClick={() => revoke(member.id)}
                                disabled={revokingId === member.id}
                                className="flex items-center gap-1 border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 hover:text-rose-900 disabled:opacity-50"
                              >
                                <UserX className="h-3.5 w-3.5" />
                                {revokingId === member.id ? "Revoking..." : "Revoke Access"}
                              </button>
                            ) : (
                              <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                Active
                              </span>
                            )
                          ) : (
                            <span className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                              Revoked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Invitations Section */}
          {invitations.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
                <Clock className="h-3.5 w-3.5" />
                Pending Collaboration Invitations ({invitations.length})
              </h3>

              <div className="divide-y divide-amber-100 border border-amber-200 bg-amber-50/40">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-amber-600" />
                      <div>
                        <span className="font-semibold text-slate-900">{inv.inviteeEmail}</span>
                        <p className="text-[11px] text-slate-500">
                          Dispatched by {inv.inviterName || inv.inviterEmail} on{" "}
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
                        Awaiting Acceptance
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}