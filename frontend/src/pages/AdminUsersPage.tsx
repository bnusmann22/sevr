import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Search,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  X,
  Trash2,
  ShieldAlert,
  MoreVertical,
  RotateCcw,
} from "lucide-react";
import { adminApi } from "../api/services";
import type { UserProfile } from "../types";

const ACADEMIC_EMAIL_PATTERN = /^[^\s@]+@(?:[a-z0-9-]+\.)*(?:edu\.ng|edu)$/i;

const ROLE_OPTIONS = [
  { value: "researcher", label: "Researcher", color: "bg-slate-100 text-slate-700" },
  { value: "supervisor", label: "Supervisor / PI", color: "bg-teal-100 text-teal-800" },
  { value: "institution_admin", label: "Institution Admin", color: "bg-blue-100 text-blue-800" },
  { value: "system_admin", label: "System Admin", color: "bg-purple-100 text-purple-800" },
];

function roleBadge(role: string) {
  return (
    ROLE_OPTIONS.find((r) => r.value === role) ?? {
      label: role,
      color: "bg-slate-100 text-slate-600",
    }
  );
}

// ---------------------------------------------------------------------------
// Credentials / Reset Modal
// ---------------------------------------------------------------------------
function CredentialsModal({
  user,
  onClose,
}: {
  user: UserProfile;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    const text = `SeVR Enclave Credentials\nEmail: ${user.email}\nTemporary Password: ${user.temporary_password}\nLogin: ${window.location.origin}/login`;
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cred-title"
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 id="cred-title" className="text-sm font-bold text-slate-900">
                Enclave Credentials Reset
              </h3>
              <p className="text-[11px] text-slate-500">
                A new temporary password has been generated.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500">Institutional Email</span>
            <p className="mt-0.5 font-mono font-semibold text-slate-900">{user.email}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">New Temporary Password</span>
            <div className="mt-1 flex items-center justify-between rounded border border-slate-300 bg-white px-3 py-2">
              <code className="font-mono font-bold tracking-wide text-emerald-700">
                {user.temporary_password}
              </code>
            </div>
          </div>
          <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-1.5 border border-amber-200">
            ⚠ Share this with the user securely. The password is hashed immediately after display.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={copyAll}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Credentials"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation Modal
// ---------------------------------------------------------------------------
function DeleteConfirmModal({
  user,
  onConfirm,
  onCancel,
  loading,
}: {
  user: UserProfile;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-xl border border-rose-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Remove Enclave Account</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">This action is permanent and cannot be undone.</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 mb-5">
          <span className="font-semibold text-slate-900">{user.name || user.email}</span>
          <br />
          <span className="text-slate-500">{user.email}</span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {loading ? "Removing..." : "Remove Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-row Actions Menu
// ---------------------------------------------------------------------------
function ActionsMenu({
  user,
  onResetCredentials,
  onChangeRole,
  onDelete,
}: {
  user: UserProfile;
  onResetCredentials: (u: UserProfile) => void;
  onChangeRole: (u: UserProfile, role: string) => void;
  onDelete: (u: UserProfile) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        id={`actions-btn-${user.id}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        title="User actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-labelledby={`actions-btn-${user.id}`}
          className="absolute right-0 z-40 mt-1 w-52 origin-top-right rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-900/5"
        >
          {/* Change Role section */}
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Change Role
            </p>
            <div className="space-y-0.5">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitem"
                  disabled={user.role === opt.value}
                  onClick={() => {
                    setOpen(false);
                    onChangeRole(user, opt.value);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition ${
                    user.role === opt.value
                      ? "cursor-default font-semibold text-slate-900 bg-slate-50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${opt.value === user.role ? "bg-emerald-500" : "bg-slate-300"}`} />
                  {opt.label}
                  {user.role === opt.value && (
                    <span className="ml-auto text-[10px] text-slate-400">current</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Credentials */}
          <div className="px-2 py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onResetCredentials(user);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 hover:bg-amber-50 hover:text-amber-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Password
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDelete(user);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Provisioning form
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("researcher");
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Modal state
  const [credentialsUser, setCredentialsUser] = useState<UserProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.listUsers({ search: search.trim() || undefined });
      setUsers(data);
    } catch {
      setError("Unable to load enclave user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  // Provision
  const handleProvision = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please provide a valid institutional email.");
      return;
    }
    if (!ACADEMIC_EMAIL_PATTERN.test(cleanEmail)) {
      setError("Email must be an institutional academic address ending in .edu or .edu.ng");
      return;
    }
    setIsProvisioning(true);
    setError("");
    try {
      const provisioned = await adminApi.provisionUser({ email: cleanEmail, role });
      setUsers((prev) => [provisioned, ...prev.filter((u) => u.id !== provisioned.id)]);
      setCredentialsUser(provisioned);
      setEmail("");
      showSuccess(`Account provisioned for ${cleanEmail}.`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message;
      setError(detail || "Failed to provision user.");
    } finally {
      setIsProvisioning(false);
    }
  };

  // Change role
  const handleChangeRole = async (target: UserProfile, newRole: string) => {
    setError("");
    try {
      const updated = await adminApi.changeRole(target.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showSuccess(`Role updated to "${ROLE_OPTIONS.find((r) => r.value === newRole)?.label}" for ${target.email}.`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message;
      setError(detail || "Failed to change role.");
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError("");
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      showSuccess(`Account for ${deleteTarget.email} has been removed.`);
      setDeleteTarget(null);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message;
      setError(detail || "Failed to remove user.");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset credentials
  const handleResetCredentials = async (target: UserProfile) => {
    setError("");
    try {
      const result = await adminApi.resetCredentials(target.id);
      setCredentialsUser(result);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message;
      setError(detail || "Failed to reset credentials.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              System Admin: User Provisioning
            </h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
              Exclusive Authority
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Provision verified academic identities and issue cryptographically secure enclave credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Directory
        </button>
      </div>

      {/* Provisioning Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <UserPlus className="h-4 w-4 text-emerald-600" />
          <h2>Provision Institutional Enclave Account</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Enter the faculty or student institutional email. A secure random temporary password will be generated for their initial login.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleProvision} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-6">
            <label htmlFor="user-email" className="block text-xs font-semibold text-slate-700">
              Institutional Email (@*.edu.ng / @*.edu) *
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. salisu.yusuf@bayero.edu.ng"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="user-role" className="block text-xs font-semibold text-slate-700">
              Enclave Role
            </label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isProvisioning || !email}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              {isProvisioning ? "Generating..." : "Provision Account"}
            </button>
          </div>
        </form>
      </div>

      {/* Directory Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Enclave User Directory</h2>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {users.length} Active Accounts
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">User &amp; Institution Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Academic KYC Status</th>
                <th className="px-4 py-3">Department &amp; Faculty</th>
                <th className="px-4 py-3 text-right">Created</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading enclave directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No users matching directory criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const badge = roleBadge(u.role);
                  return (
                    <tr key={u.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {u.name || u.email.split("@")[0].replace(".", " ")}
                        </div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.profile_completed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                            <Check className="h-3 w-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                            Pending Setup
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {u.department ? (
                          <div>
                            <div>{u.department}</div>
                            {u.faculty && <div className="text-[10px] text-slate-400">{u.faculty}</div>}
                          </div>
                        ) : (
                          <span className="italic text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-[11px] text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Active"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ActionsMenu
                          user={u}
                          onResetCredentials={handleResetCredentials}
                          onChangeRole={handleChangeRole}
                          onDelete={setDeleteTarget}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credentials Modal */}
      {credentialsUser && (
        <CredentialsModal user={credentialsUser} onClose={() => setCredentialsUser(null)} />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
