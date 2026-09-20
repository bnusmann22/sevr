import { useState, useMemo } from "react";
import { Plus, Trash2, ArrowUpDown, Filter, AlertTriangle, ShieldCheck, FileSpreadsheet } from "lucide-react";

interface DatasetGridEditorProps {
  initialContent: string;
  onChange: (updatedContent: string) => void;
  isReadOnly?: boolean;
}

export default function DatasetGridEditor({ initialContent, onChange, isReadOnly = false }: DatasetGridEditorProps) {
  // Parse CSV/TSV content into headers and rows
  const { initialHeaders, initialRows, delimiter } = useMemo(() => {
    let delim = ",";
    const lines = initialContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length > 0 && lines[0].includes("\t")) {
      delim = "\t";
    }

    if (lines.length === 0) {
      return {
        initialHeaders: ["Column_1", "Column_2", "Column_3"],
        initialRows: [["", "", ""]],
        delimiter: ",",
      };
    }

    const parseLine = (line: string) => {
      // Basic CSV splitter respecting quotes
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delim && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const parsed = parseLine(line);
      // Pad row to match headers count
      while (parsed.length < headers.length) parsed.push("");
      return parsed.slice(0, headers.length);
    });

    return {
      initialHeaders: headers.length > 0 ? headers : ["Column_1", "Column_2"],
      initialRows: rows.length > 0 ? rows : [new Array(headers.length).fill("")],
      delimiter: delim,
    };
  }, [initialContent]);

  const [headers, setHeaders] = useState<string[]>(initialHeaders);
  const [rows, setRows] = useState<string[][]>(initialRows);
  const [filterText, setFilterText] = useState("");
  const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [sanitizationAlert, setSanitizationAlert] = useState<string | null>(null);

  // Helper to trigger parent content update
  const notifyChange = (updatedHeaders: string[], updatedRows: string[][]) => {
    const headerLine = updatedHeaders.map((h) => (h.includes(delimiter) ? `"${h}"` : h)).join(delimiter);
    const rowLines = updatedRows.map((r) =>
      r.map((cell) => (cell.includes(delimiter) ? `"${cell}"` : cell)).join(delimiter)
    );
    const fullCsv = [headerLine, ...rowLines].join("\n");
    onChange(fullCsv);
  };

  // CSV Formula Injection Sanitizer
  const sanitizeCellValue = (val: string): string => {
    let sanitized = val.trim();
    if (/^[=+\-@\t\r]/.test(sanitized)) {
      setSanitizationAlert(`Formula injection prefix detected and sanitized on cell value "${val}"`);
      sanitized = `'${sanitized}`;
      setTimeout(() => setSanitizationAlert(null), 4000);
    }
    return sanitized;
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    if (isReadOnly) return;
    const cleanValue = sanitizeCellValue(value);
    const newRows = rows.map((r, rIdx) => {
      if (rIdx !== rowIndex) return r;
      const copy = [...r];
      copy[colIndex] = cleanValue;
      return copy;
    });
    setRows(newRows);
    notifyChange(headers, newRows);
  };

  const handleHeaderChange = (colIndex: number, newName: string) => {
    if (isReadOnly) return;
    const newHeaders = [...headers];
    newHeaders[colIndex] = newName || `Col_${colIndex + 1}`;
    setHeaders(newHeaders);
    notifyChange(newHeaders, rows);
  };

  const addRow = () => {
    if (isReadOnly) return;
    const newRow = new Array(headers.length).fill("");
    const newRows = [...rows, newRow];
    setRows(newRows);
    notifyChange(headers, newRows);
  };

  const deleteRow = (rowIndex: number) => {
    if (isReadOnly || rows.length <= 1) return;
    const newRows = rows.filter((_, idx) => idx !== rowIndex);
    setRows(newRows);
    notifyChange(headers, newRows);
  };

  const addColumn = () => {
    if (isReadOnly) return;
    const newHeaders = [...headers, `Column_${headers.length + 1}`];
    const newRows = rows.map((r) => [...r, ""]);
    setHeaders(newHeaders);
    setRows(newRows);
    notifyChange(newHeaders, newRows);
  };

  const deleteColumn = (colIndex: number) => {
    if (isReadOnly || headers.length <= 1) return;
    const newHeaders = headers.filter((_, idx) => idx !== colIndex);
    const newRows = rows.map((r) => r.filter((_, idx) => idx !== colIndex));
    setHeaders(newHeaders);
    setRows(newRows);
    notifyChange(newHeaders, newRows);
  };

  const handleSort = (colIndex: number) => {
    if (sortColumnIndex === colIndex) {
      setSortAscending(!sortAscending);
    } else {
      setSortColumnIndex(colIndex);
      setSortAscending(true);
    }
  };

  // Filtered and Sorted rows calculation
  const displayedRows = useMemo(() => {
    let result = rows.map((r, idx) => ({ row: r, originalIndex: idx }));

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      result = result.filter(({ row }) => row.some((cell) => cell.toLowerCase().includes(q)));
    }

    if (sortColumnIndex !== null) {
      result.sort((a, b) => {
        const valA = a.row[sortColumnIndex] || "";
        const valB = b.row[sortColumnIndex] || "";
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAscending ? numA - numB : numB - numA;
        }
        return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return result;
  }, [rows, filterText, sortColumnIndex, sortAscending]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-sans">
      {/* Editor Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-mono font-bold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ENCLAVE TABULAR GRID</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <span>Rows: <strong className="text-white">{rows.length}</strong></span>
            <span>·</span>
            <span>Columns: <strong className="text-white">{headers.length}</strong></span>
            <span>·</span>
            <span>Format: <strong className="text-emerald-400">{delimiter === "\t" ? "TSV" : "CSV"}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search/Filter Bar */}
          <div className="relative">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter grid rows..."
              className="w-44 px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Filter className="w-3 h-3 text-slate-400 absolute right-2 top-2" />
          </div>

          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={addRow}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 transition text-xs shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Row
              </button>
              <button
                type="button"
                onClick={addColumn}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg flex items-center gap-1 transition text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Col
              </button>
            </>
          )}
        </div>
      </div>

      {/* Security Formula Injection Warning Banner */}
      {sanitizationAlert && (
        <div className="px-4 py-2 bg-amber-950/90 border-b border-amber-800 text-amber-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          <span>{sanitizationAlert}</span>
        </div>
      )}

      {/* Interactive Tabular Grid Container */}
      <div className="flex-1 overflow-auto max-h-[560px] scrollbar-thin scrollbar-thumb-slate-700">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
              <th className="w-12 px-3 py-2 text-center text-[10px] text-slate-600 bg-slate-950 border-r border-slate-800">
                #
              </th>
              {headers.map((header, colIdx) => (
                <th
                  key={colIdx}
                  className="px-3 py-2 border-r border-slate-800 font-semibold min-w-[140px] max-w-[220px]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={header}
                      onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                      className="bg-transparent text-slate-200 font-bold font-mono focus:outline-none focus:border-b focus:border-emerald-400 w-full"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSort(colIdx)}
                        title="Sort column"
                        className={`p-1 rounded hover:bg-slate-800 ${
                          sortColumnIndex === colIdx ? "text-emerald-400 font-bold" : "text-slate-500"
                        }`}
                      >
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                      {!isReadOnly && headers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteColumn(colIdx)}
                          title="Delete column"
                          className="p-1 rounded hover:bg-rose-950 text-slate-600 hover:text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
            {displayedRows.map(({ row, originalIndex }, displayIdx) => (
              <tr key={originalIndex} className="hover:bg-slate-800/50 transition">
                <td className="w-12 px-2 py-1.5 text-center text-[10px] text-slate-500 bg-slate-950/60 border-r border-slate-800 select-none">
                  <div className="flex items-center justify-between">
                    <span>{displayIdx + 1}</span>
                    {!isReadOnly && rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteRow(originalIndex)}
                        title="Delete row"
                        className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </td>
                {row.map((cellValue, colIdx) => (
                  <td key={colIdx} className="px-2 py-1 border-r border-slate-800/60">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={cellValue}
                      onChange={(e) => handleCellChange(originalIndex, colIdx, e.target.value)}
                      className="w-full bg-transparent text-slate-200 focus:outline-none focus:bg-slate-950 focus:ring-1 focus:ring-emerald-500 px-1.5 py-0.5 rounded transition"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Status Bar Footer */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Formula Injection Shield: ACTIVE</span>
        </div>
        <div>Showing {displayedRows.length} of {rows.length} rows</div>
      </div>
    </div>
  );
}
