import type { TLPLabel } from "../../types";
import { Shield, Lock, AlertTriangle } from "lucide-react";

interface TlpSelectorProps {
  value: TLPLabel;
  onChange: (val: TLPLabel) => void;
  canOverrideRed?: boolean;
}

export default function TlpSelector({ value, onChange, canOverrideRed = false }: TlpSelectorProps) {
  const options: TLPLabel[] = ["CLEAR", "GREEN", "AMBER", "AMBER_STRICT", "RED"];

  return (
    <div className="flex flex-wrap gap-2 text-xs font-medium">
      {options.map((option) => {
        const isSelected = value === option;
        const isDisabled = (option === "RED" || option === "AMBER_STRICT") && !canOverrideRed;
        const Icon = option === "RED" ? Lock : option === "AMBER_STRICT" ? AlertTriangle : Shield;

        return (
          <button
            key={option}
            type="button"
            disabled={isDisabled}
            onClick={() => onChange(option)}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
              isSelected
                ? "border-slate-900 bg-slate-900 text-white font-bold shadow-xs"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <Icon className="w-3.5 h-3.5" />
            TLP:{option}
          </button>
        );
      })}
    </div>
  );
}
