import type { ExportDecision } from "../../types";
import { CheckCircle, Lock } from "lucide-react";

export default function ExportOutcomeBanner({ decision }: { decision: ExportDecision }) {
  const isNative = decision.outcome === "native";

  return (
    <div
      className={`p-4 rounded-lg border text-xs ${
        isNative
          ? "bg-emerald-50 border-emerald-300 text-emerald-900"
          : "bg-amber-50 border-amber-300 text-amber-900"
      }`}
    >
      <div className="flex items-center gap-2 font-bold mb-1">
        {isNative ? (
          <span className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Native Export Granted
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-amber-800">
            <Lock className="w-4 h-4 text-amber-600" /> .sevr Container Enforced
          </span>
        )}
      </div>
      <p className="text-slate-700 leading-relaxed">{decision.reason}</p>
    </div>
  );
}
