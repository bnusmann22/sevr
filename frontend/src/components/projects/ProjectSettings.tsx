import { FormEvent, useState } from "react";
import type { TLPLabel } from "../../types";
import TlpSelector from "../tlp/TlpSelector";

export default function ProjectSettings() {
  const [name, setName] = useState("Rural Groundwater Contamination Study");
  const [description, setDescription] = useState("Institutional groundwater research enclave.");
  const [tlp, setTlp] = useState<TLPLabel>("AMBER");
  const [status, setStatus] = useState("");
  const save = (event: FormEvent) => { event.preventDefault(); setStatus("Settings saved in this UI demonstration."); };
  return <form onSubmit={save} className="max-w-xl space-y-4"><div><h2 className="text-sm font-bold text-slate-900">Project settings</h2><p className="mt-1 text-xs text-slate-500">Changes are local to the current mock session.</p></div><label className="block text-xs font-semibold text-slate-700">Project name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" /></label><label className="block text-xs font-semibold text-slate-700">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" /></label><div><p className="mb-2 text-xs font-semibold text-slate-700">Default TLP</p><TlpSelector value={tlp} onChange={setTlp} /></div><button type="submit" className="bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Save changes</button>{status && <p role="status" className="text-xs text-emerald-700">{status}</p>}</form>;
}