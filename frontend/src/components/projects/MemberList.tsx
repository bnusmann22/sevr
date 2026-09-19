import { FormEvent, useEffect, useState } from "react";
import { membersApi, type ProjectMember } from "../../api/services";
import { readAuthSession } from "../../pages/LoginPage";
import { UserPlus, UserX, AlertCircle, RefreshCw, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function MemberList({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const session = readAuthSession();
  const canManage = ["supervisor", "institution_admin"].includes(session?.role ?? "");

  const loadMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await membersApi.list(projectId);
      setMembers(data);
    } catch {
      setError("Unable to load enclave membership roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const invite = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setMessage("Enter a valid institutional email.");
      return;
    }
    setInviting(true);
    setMessage("");
    try {
      const newMember = await membersApi.invite(projectId, email);
      setMembers((current) => [...current, newMember]);
      setMessage(`Invitation prepared and access granted to ${email}.`);
      setEmail("");
    } catch {
      setMessage("Unable to prepare invitation.");
    } finally {
      setInviting(false);
    }
  };

  const revoke = async (memberId: string) => {
    setRevokingId(memberId);
    try {
      const updated = await membersApi.revoke(projectId, memberId);
      setMembers((current) => current.map((m) => (m.id === memberId ? updated : m)));
      setMessage("Member access has been revoked immediately under ABAC policy.");
    } catch {
      setMessage("Unable to revoke this member.");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Enclave Membership &amp; ABAC Policy
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {canManage
              ? "Supervisors can provision collaborator seats or execute instantaneous cryptographic access revocation."
              : "Read-only access: Enclave access roster governed by Principal Investigator / Supervisor."}
          </p>
        </div>

        <button
          type="button"
          onClick={loadMembers}
          className="flex items-center gap-1 border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {canManage && (
        <form onSubmit={invite} className="flex gap-2">
          <label className="sr-only" htmlFor="invite-email">
            Member institutional email
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@institution.edu"
            className="min-w-0 flex-1 border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={inviting || !email}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 px-3 py-2 text-xs font-semibold text-white transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {inviting ? "Inviting..." : "Invite Member"}
          </button>
        </form>
      )}

      {message && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center justify-between border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadMembers}
            className="font-semibold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <p role="status" className="text-xs text-slate-500">
          Loading enclave membership roster...
        </p>
      )}

      {!loading && !error && (
        <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
          {members.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 text-center">No active members found in this enclave.</p>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        member.role === "Supervisor"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {member.email} · {member.department}
                  </p>
                </div>

                <div>
                  {member.status === "active" ? (
                    canManage ? (
                      <button
                        type="button"
                        onClick={() => revoke(member.id)}
                        disabled={revokingId === member.id}
                        className="flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 px-2.5 py-1 border border-rose-200 hover:bg-rose-100 transition"
                      >
                        <UserX className="h-3.5 w-3.5" />
                        {revokingId === member.id ? "Revoking..." : "Revoke Access"}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active
                      </span>
                    )
                  ) : (
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Revoked
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}