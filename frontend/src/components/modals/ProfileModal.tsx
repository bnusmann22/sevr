import { FormEvent, useEffect, useState } from "react";
import { X, UserCheck, AlertCircle, CheckCircle2, GraduationCap, Building2 } from "lucide-react";
import { profileApi } from "../../api/services";
import { readAuthSession, persistAuthSession } from "../../pages/LoginPage";
import type { UserProfile } from "../../types";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updated: UserProfile) => void;
  mandatory?: boolean;
};

const TITLES = ["Dr", "Assoc. Prof", "Prof", "Mr", "Mrs", "Ms"];
const EDU_STATUSES = ["Student", "Staff", "PI"] as const;
const CADRES = ["Undergraduate", "Postgraduate"] as const;
const LEVELS = ["100L", "200L", "300L", "400L", "500L", "MSc", "PhD"];

export default function ProfileModal({ isOpen, onClose, onSaved, mandatory = false }: ProfileModalProps) {
  const session = readAuthSession();

  const [form, setForm] = useState({
    title: "",
    name: "",
    edu_status: "Staff" as string,
    student_cadre: "Postgraduate" as string,
    student_level: "MSc" as string,
    department: "",
    faculty: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError("");
    setSuccess("");

    profileApi
      .getProfile()
      .then((data) => {
        setForm({
          title: data.title || "Dr",
          name: data.name || session?.name || "",
          edu_status: data.edu_status || "Staff",
          student_cadre: data.student_cadre || "Postgraduate",
          student_level: data.student_level || "MSc",
          department: data.department || session?.department || "",
          faculty: data.faculty || "",
        });
      })
      .catch(() => {
        // Fallback to active session values
        setForm((prev) => ({
          ...prev,
          name: session?.name || "",
          department: session?.department || "",
        }));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!form.department.trim()) {
      setError("Department affiliation is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload: Partial<UserProfile> = {
        title: form.title,
        name: form.name.trim(),
        edu_status: form.edu_status,
        department: form.department.trim(),
        faculty: form.faculty.trim(),
        profile_completed: true,
      };

      if (form.edu_status === "Student") {
        payload.student_cadre = form.student_cadre;
        payload.student_level = form.student_level;
      }

      const updated = await profileApi.updateProfile(payload);

      // Update local storage session
      if (session) {
        const updatedSession = {
          ...session,
          name: updated.name || form.name.trim(),
          department: updated.department || form.department.trim(),
          title: updated.title,
          profile_completed: true,
        };
        persistAuthSession(updatedSession, true);
      }

      setSuccess("Academic profile completed successfully.");
      onSaved?.(updated);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-7"
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-bold text-slate-900">
                Academic Profile &amp; KYC
              </h2>
              <p className="text-xs text-slate-500">
                Institutional accreditation and enclave governance verification.
              </p>
            </div>
          </div>

          {!mandatory && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading profile credentials...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="user-title" className="block text-xs font-semibold text-slate-700">
                  Title
                </label>
                <select
                  id="user-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="">Select...</option>
                  {TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label htmlFor="user-name" className="block text-xs font-semibold text-slate-700">
                  Full Name *
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Jamil Yusuf"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Institutional / Educational Status
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {EDU_STATUSES.map((status) => {
                  const isChecked = form.edu_status === status;
                  return (
                    <label
                      key={status}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        isChecked
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="edu_status"
                        value={status}
                        checked={isChecked}
                        onChange={() => setForm({ ...form, edu_status: status })}
                        className="sr-only"
                      />
                      {status}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Conditional Student Section: Only visible when Status === 'Student' */}
            {form.edu_status === "Student" && (
              <div className="rounded-lg border border-teal-100 bg-teal-50/60 p-3.5 transition-all">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-teal-800">
                  Student Verification Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="student-cadre" className="block text-xs font-semibold text-slate-700">
                      Cadre
                    </label>
                    <select
                      id="student-cadre"
                      value={form.student_cadre}
                      onChange={(e) => setForm({ ...form, student_cadre: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      {CADRES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="academic-level" className="block text-xs font-semibold text-slate-700">
                      Academic Level
                    </label>
                    <select
                      id="academic-level"
                      value={form.student_level}
                      onChange={(e) => setForm({ ...form, student_level: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      {LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="faculty" className="block text-xs font-semibold text-slate-700">
                  Faculty / School
                </label>
                <input
                  id="faculty"
                  type="text"
                  value={form.faculty}
                  onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                  placeholder="e.g. Faculty of Earth & Environmental"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-xs font-semibold text-slate-700">
                  Department *
                </label>
                <input
                  id="department"
                  type="text"
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Environmental Sciences"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              {!mandatory && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
              )}
              <button
                id="profile-save-btn"
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4" />
                {submitting ? "Saving Profile..." : "Save Academic Profile"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
