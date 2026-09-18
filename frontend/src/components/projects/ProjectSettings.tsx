import { FormEvent, useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import type { Project } from "../../types";
import type { TLPLabel } from "../../types";
import TlpSelector from "../tlp/TlpSelector";

export default function ProjectSettings({ projectId }: { projectId: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tlp, setTlp] = useState<TLPLabel>("AMBER");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { apiClient.get<Project>(`/projects/${projectId}`).then(({ data }) => { setName(data.name); setDescription(data.description ?? ""); setTlp(data.defaultTlp ?? "AMBER"); }).catch(() => setError("Unable to load project settings.")).finally(() => setLoading(false)); }, [projectId]);
  const save = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setError(""); setStatus(""); try { await apiClient.patch(`/projects/${projectId}`, { name, description, defaultTlp: tlp }); setStatus("Project settings saved."); } catch { setError("Unable to save project settings."); } finally { setSaving(false); } };
  if (loading) return <p role="status" className="text-sm text-slate-500">Loading project settings...</p>;
  return <form onSubmit={save} className="max-w-xl space-y-4"><div><h2 className="text-sm font-bold text-slate-900">Project settings</h2><p className="mt-1 text-xs text-slate-500">Changes are saved through the current mock project contract.</p></div>{error && <p role="alert" className="border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}<label className="block text-xs font-semibold text-slate-700">Project name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" /></label><label className="block text-xs font-semibold text-slate-700">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" /></label><div><p className="mb-2 text-xs font-semibold text-slate-700">Default TLP</p><TlpSelector value={tlp} onChange={setTlp} /></div><button type="submit" disabled={saving} className="bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>{status && <p role="status" className="text-xs text-emerald-700">{status}</p>}</form>;
}