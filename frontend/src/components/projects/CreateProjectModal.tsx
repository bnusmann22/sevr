import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import type { TLPLabel } from "../../types";
import TlpSelector from "../tlp/TlpSelector";

type CreateProjectModalProps = { isOpen: boolean; isSubmitting?: boolean; onClose: () => void; onCreated: (name: string, description: string, defaultTlp: TLPLabel) => void | Promise<void> };

export default function CreateProjectModal({ isOpen, isSubmitting = false, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultTlp, setDefaultTlp] = useState<TLPLabel>("AMBER");
  const [error, setError] = useState("");
  if (!isOpen) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { setError("Project name is required."); return; }
    onCreated(name.trim(), description.trim(), defaultTlp);
    setName(""); setDescription(""); setError("");
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="create-project-title">
    <form onSubmit={submit} className="w-full max-w-lg space-y-4 border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between"><h2 id="create-project-title" className="text-base font-bold text-slate-900">Create project</h2><button type="button" onClick={onClose} aria-label="Close create project dialog" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
      <label className="block text-xs font-semibold text-slate-700">Project name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" /></label>
      <label className="block text-xs font-semibold text-slate-700">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" /></label>
      <div><p className="mb-2 text-xs font-semibold text-slate-700">Default TLP</p><TlpSelector value={defaultTlp} onChange={setDefaultTlp} /></div>
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" disabled={isSubmitting} onClick={onClose} className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" disabled={isSubmitting} className="bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">{isSubmitting ? "Creating..." : "Create project"}</button></div>
    </form>
  </div>;
}