import { FormEvent, useState } from "react";
import { UserPlus, UserX } from "lucide-react";

type Member = { id: string; name: string; email: string; role: string; department: string; status: "active" | "revoked" };
const initialMembers: Member[] = [
  { id: "member-1", name: "Dr. Ada Okafor", email: "researcher@bayero.edu.ng", role: "Supervisor", department: "Environmental Sciences", status: "active" },
  { id: "member-2", name: "Jamil Yusuf", email: "jamil@bayero.edu.ng", role: "Researcher", department: "Environmental Sciences", status: "active" },
];

export default function MemberList() {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const invite = (event: FormEvent) => { event.preventDefault(); if (!email.includes("@")) { setMessage("Enter a valid institutional email."); return; } setMessage(`Invitation prepared for ${email}.`); setEmail(""); };
  return <section className="space-y-4"><div><h2 className="text-sm font-bold text-slate-900">Project members</h2><p className="mt-1 text-xs text-slate-500">Manage access in this UI demonstration.</p></div><form onSubmit={invite} className="flex gap-2"><label className="sr-only" htmlFor="invite-email">Member email</label><input id="invite-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="member@university.edu" className="min-w-0 flex-1 border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none" /><button type="submit" className="flex items-center gap-1 bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><UserPlus className="h-3.5 w-3.5" />Invite</button></form>{message && <p role="status" className="text-xs text-emerald-700">{message}</p>}<div className="divide-y divide-slate-200 border border-slate-200 bg-white">{members.map((member) => <div key={member.id} className="flex items-center justify-between gap-4 p-4"><div><p className="text-sm font-semibold text-slate-900">{member.name}</p><p className="text-xs text-slate-500">{member.email} · {member.role} · {member.department}</p></div>{member.status === "active" ? <button type="button" onClick={() => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, status: "revoked" } : item))} className="flex items-center gap-1 text-xs font-semibold text-rose-700"><UserX className="h-3.5 w-3.5" />Revoke</button> : <span className="text-xs font-semibold text-rose-700">Revoked</span>}</div>)}</div></section>;
}