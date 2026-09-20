import { useState, useMemo } from "react";
import { FileText, Eye, Columns, WrapText, Search, ShieldCheck, Check } from "lucide-react";

interface DocumentCodeEditorProps {
  initialContent: string;
  originalContent?: string;
  onChange: (updatedContent: string) => void;
  format?: string;
  isReadOnly?: boolean;
}

export default function DocumentCodeEditor({
  initialContent,
  originalContent,
  onChange,
  format = "txt",
  isReadOnly = false,
}: DocumentCodeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<"editor" | "split" | "diff">("split");
  const [wordWrap, setWordWrap] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const handleTextChange = (val: string) => {
    setContent(val);
    onChange(val);
  };

  const lines = useMemo(() => content.split("\n"), [content]);
  const baseLines = useMemo(() => (originalContent || initialContent).split("\n"), [originalContent, initialContent]);

  // Basic diff line computation
  const diffLines = useMemo(() => {
    const max = Math.max(lines.length, baseLines.length);
    const diffs = [];
    for (let i = 0; i < max; i++) {
      const orig = baseLines[i] ?? "";
      const curr = lines[i] ?? "";
      if (orig === curr) {
        diffs.push({ type: "same", line: curr, lineNum: i + 1 });
      } else if (i >= baseLines.length) {
        diffs.push({ type: "added", line: curr, lineNum: i + 1 });
      } else if (i >= lines.length) {
        diffs.push({ type: "removed", line: orig, lineNum: i + 1 });
      } else {
        diffs.push({ type: "modified", line: curr, origLine: orig, lineNum: i + 1 });
      }
    }
    return diffs;
  }, [lines, baseLines]);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-sans">
      {/* Code Editor Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-mono font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span className="uppercase">DOCUMENT CODEBOOK ({format})</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <span>Lines: <strong className="text-white">{lines.length}</strong></span>
            <span>·</span>
            <span>Chars: <strong className="text-white">{content.length}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switches */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`px-2.5 py-1 rounded transition ${
                viewMode === "editor" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Editor Only
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
                viewMode === "split" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Columns className="w-3 h-3" />
              Live Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode("diff")}
              className={`px-2.5 py-1 rounded transition ${
                viewMode === "diff" ? "bg-slate-800 text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Diff View
            </button>
          </div>

          <button
            type="button"
            onClick={() => setWordWrap(!wordWrap)}
            title="Toggle Word Wrap"
            className={`p-1.5 rounded-lg border text-xs font-mono transition flex items-center gap-1 ${
              wordWrap ? "bg-emerald-950/60 border-emerald-700 text-emerald-400" : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Sandbox Workspace Body */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
        {/* Left Column: Code / Text Editor */}
        {viewMode !== "diff" && (
          <div className={`${viewMode === "split" ? "md:col-span-6 border-r border-slate-800" : "md:col-span-12"} flex flex-col relative`}>
            <div className="flex flex-1 relative font-mono text-xs overflow-auto">
              {/* Line Numbers Sidebar */}
              <div className="select-none py-3 px-2 bg-slate-950 border-r border-slate-800 text-right text-slate-600 font-mono text-[11px] min-w-[40px]">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea Input */}
              <textarea
                disabled={isReadOnly}
                value={content}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter dataset metadata notes, markdown codebook, or manuscript text..."
                wrap={wordWrap ? "soft" : "off"}
                className="flex-1 p-3 bg-slate-950 text-slate-100 resize-none outline-none font-mono text-xs leading-relaxed focus:ring-0 border-0"
              />
            </div>
          </div>
        )}

        {/* Right Column: Live Rendered Preview (Split Mode) */}
        {viewMode === "split" && (
          <div className="md:col-span-6 p-4 bg-slate-900/60 overflow-auto text-xs font-sans text-slate-200 leading-relaxed space-y-4">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 border-b border-slate-800 pb-2">
              <Eye className="w-3.5 h-3.5" />
              <span>LIVE RENDERED DOCUMENT PREVIEW</span>
            </div>

            <div className="prose prose-invert prose-xs max-w-none space-y-3 font-sans">
              {lines.map((line, idx) => {
                if (line.startsWith("# ")) return <h1 key={idx} className="text-xl font-bold text-white border-b border-slate-800 pb-1">{line.slice(2)}</h1>;
                if (line.startsWith("## ")) return <h2 key={idx} className="text-lg font-bold text-emerald-400 mt-2">{line.slice(3)}</h2>;
                if (line.startsWith("### ")) return <h3 key={idx} className="text-base font-bold text-slate-200 mt-1">{line.slice(4)}</h3>;
                if (line.startsWith("- ")) return <li key={idx} className="ml-4 list-disc text-slate-300">{line.slice(2)}</li>;
                if (line.trim().length === 0) return <div key={idx} className="h-2" />;
                return <p key={idx} className="text-slate-300">{line}</p>;
              })}
            </div>
          </div>
        )}

        {/* Diff Mode Comparison Screen */}
        {viewMode === "diff" && (
          <div className="md:col-span-12 p-4 bg-slate-950 overflow-auto font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2 mb-3">
              <span className="text-amber-400 font-bold">SIDE-BY-SIDE REVISION DIFF COMPARISON (v1.0 vs Active Sandbox Draft)</span>
              <span className="text-slate-500">{diffLines.filter((d) => d.type !== "same").length} lines modified</span>
            </div>

            <div className="space-y-1">
              {diffLines.map((diff, i) => {
                if (diff.type === "same") {
                  return (
                    <div key={i} className="flex gap-3 text-slate-500 px-2 py-0.5 font-mono text-[11px]">
                      <span className="w-8 text-right text-slate-600 select-none">{diff.lineNum}</span>
                      <span className="flex-1">{diff.line}</span>
                    </div>
                  );
                }
                if (diff.type === "added") {
                  return (
                    <div key={i} className="flex gap-3 bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 px-2 py-0.5 font-mono text-[11px]">
                      <span className="w-8 text-right text-emerald-600 select-none">{diff.lineNum}</span>
                      <span className="flex-1">+ {diff.line}</span>
                    </div>
                  );
                }
                if (diff.type === "modified") {
                  return (
                    <div key={i} className="space-y-0.5">
                      <div className="flex gap-3 bg-rose-950/40 text-rose-300 border-l-2 border-rose-500 px-2 py-0.5 font-mono text-[11px] line-through opacity-75">
                        <span className="w-8 text-right text-rose-600 select-none">{diff.lineNum}</span>
                        <span className="flex-1">- {diff.origLine}</span>
                      </div>
                      <div className="flex gap-3 bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 px-2 py-0.5 font-mono text-[11px]">
                        <span className="w-8 text-right text-emerald-600 select-none">{diff.lineNum}</span>
                        <span className="flex-1">+ {diff.line}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sanitization Boundary: UTF-8 Enclave Safe</span>
        </div>
        <div>Format: .{format.toUpperCase()}</div>
      </div>
    </div>
  );
}
