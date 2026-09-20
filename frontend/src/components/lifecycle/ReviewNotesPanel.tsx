import { useState } from "react";
import { MessageSquare, ShieldCheck, UserCheck, Send, Clock, FileText } from "lucide-react";
import type { FileReviewNote } from "../../types";

interface Props {
  notes: FileReviewNote[];
  onAddNote: (content: string, noteType: FileReviewNote["noteType"]) => Promise<void>;
  currentUserName?: string;
}

export default function ReviewNotesPanel({ notes, onAddNote, currentUserName = "Researcher" }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "PEER_COMMENT" | "SUPERVISOR_JUSTIFICATION">("all");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteType, setNoteType] = useState<FileReviewNote["noteType"]>("PEER_COMMENT");
  const [submitting, setSubmitting] = useState(false);

  const filteredNotes = activeTab === "all" ? notes : notes.filter((n) => n.noteType === activeTab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onAddNote(newNoteContent.trim(), noteType);
      setNewNoteContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          Review Notes &amp; Justification Ledger
        </h3>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Notes ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PEER_COMMENT")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeTab === "PEER_COMMENT" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Peer Comments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SUPERVISOR_JUSTIFICATION")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeTab === "SUPERVISOR_JUSTIFICATION" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Supervisor Notes
          </button>
        </div>
      </div>

      {/* Notes Stream */}
      <div className="mb-4 max-h-60 space-y-3 overflow-y-auto pr-1">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-6 text-center">
            <FileText className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-medium text-slate-500">No review notes recorded yet.</p>
            <p className="text-[10px] text-slate-400">Add feedback or supervisor approval notes below.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`rounded-lg border p-3 text-xs transition ${
                note.noteType === "SUPERVISOR_JUSTIFICATION"
                  ? "border-amber-200 bg-amber-50/60"
                  : "border-slate-100 bg-slate-50/80"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-slate-900">
                  {note.noteType === "SUPERVISOR_JUSTIFICATION" ? (
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  {note.authorName}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Add New Note Form */}
      <form onSubmit={handleSubmit} className="mt-auto border-t border-slate-100 pt-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">Posting as: <strong className="text-slate-700">{currentUserName}</strong></span>
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as FileReviewNote["noteType"])}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="PEER_COMMENT">Peer Review Comment</option>
            <option value="SUPERVISOR_JUSTIFICATION">Supervisor Justification</option>
            <option value="TLP_OVERRIDE_REASON">TLP Override Reason</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write a review note or edit feedback..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newNoteContent.trim() || submitting}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
