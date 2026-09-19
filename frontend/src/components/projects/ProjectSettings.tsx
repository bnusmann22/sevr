import { FormEvent, useEffect, useState } from "react";
import { projectsApi } from "../../api/services";
import type { Project, TLPLabel } from "../../types";
import TlpSelector from "../tlp/TlpSelector";
import { readAuthSession } from "../../pages/LoginPage";
import { Lock, Save, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

interface ProjectSettingsProps {
  projectId: string;
  onProjectUpdated?: (project: Project) => void;
}

export default function ProjectSettings({ projectId, onProjectUpdated }: ProjectSettingsProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tlp, setTlp] = useState<TLPLabel>("AMBER");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const session = readAuthSession();
  const canManage = ["supervisor", "institution_admin"].includes(session?.role ?? "");

  const loadSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await projectsApi.get(projectId);
      setName(data.name);
      setDescription(data.description ?? "");
      setTlp(data.defaultTlp ?? "AMBER");
      onProjectUpdated?.(data);
    } catch {
      setError("Unable to retrieve enclave policy configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [projectId]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!canManage) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Research project name cannot be empty.");
      return;
    }
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const updated = await projectsApi.update(projectId, {
        name: trimmedName,
        description: description.trim(),
        defaultTlp: tlp,
      });
      setName(updated.name);
      setDescription(updated.description ?? "");
      setTlp(updated.defaultTlp ?? "AMBER");
      setStatus("Enclave parameters and default TLP classification policy saved successfully.");
      onProjectUpdated?.(updated);
    } catch {
      setError("Unable to update project settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl space-y-3 animate-pulse">
        <div className="h-4 w-1/3 bg-slate-200" />
        <div className="h-9 w-full bg-slate-100" />
        <div className="h-20 w-full bg-slate-100" />
      </div>
    );
  }

  return (
    <form onSubmit={save} className="max-w-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Enclave Configuration &amp; Policy</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {canManage
              ? "Manage security baseline, default data classification, and research enclave metadata."
              : "Read-only: Institutional policy parameters are managed exclusively by Supervisors."}
          </p>
        </div>
        <button
          type="button"
          onClick={loadSettings}
          className="flex items-center gap-1 border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-3 w-3" />
          Reload
        </button>
      </div>

      {!canManage && (
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 rounded">
          <Lock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            You are viewing this enclave with <strong className="text-slate-800">Researcher</strong> credentials. Changes to default TLP classification and vault descriptors require elevated Supervisor authority.
          </p>
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
            onClick={loadSettings}
            className="font-semibold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {status && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{status}</span>
        </div>
      )}

      <label className="block text-xs font-semibold text-slate-700">
        Research Project Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canManage}
          className="mt-1 w-full border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-500 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
        />
      </label>

      <label className="block text-xs font-semibold text-slate-700">
        Scope &amp; Abstract Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!canManage}
          rows={3}
          className="mt-1 w-full border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-500 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
        />
      </label>

      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">Default Enclave Ingestion TLP</p>
        {canManage ? (
          <TlpSelector value={tlp} onChange={setTlp} canOverrideRed={true} />
        ) : (
          <div className="border border-slate-200 bg-slate-50 p-3 rounded text-xs text-slate-700 font-mono">
            TLP:{tlp} (Policy fixed)
          </div>
        )}
      </div>

      {canManage && (
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 px-4 py-2 text-xs font-semibold text-white transition"
          >
            <Save className="h-3.5 w-3.5 text-emerald-400" />
            {saving ? "Saving Changes..." : "Save Enclave Settings"}
          </button>
        </div>
      )}
    </form>
  );
}