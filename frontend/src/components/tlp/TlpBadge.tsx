import type { TLPLabel } from "../../types";
import { Shield, Lock, AlertTriangle } from "lucide-react";

const STYLES: Record<TLPLabel, { bg: string; icon: typeof Shield }> = {
  CLEAR: { bg: "bg-slate-100 text-slate-800 border-slate-300", icon: Shield },
  WHITE: { bg: "bg-slate-100 text-slate-800 border-slate-300", icon: Shield },
  GREEN: { bg: "bg-emerald-50 text-emerald-700 border-emerald-300", icon: Shield },
  AMBER: { bg: "bg-amber-50 text-amber-700 border-amber-300", icon: Shield },
  AMBER_STRICT: { bg: "bg-orange-50 text-orange-800 border-orange-400", icon: Lock },
  RED: { bg: "bg-rose-50 text-rose-700 border-rose-300 font-bold", icon: Lock },
};

export default function TlpBadge({ label }: { label: TLPLabel }) {
  const style = STYLES[label] ?? STYLES.CLEAR;
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold tracking-wider ${style.bg}`}
      title={`Traffic Light Protocol: ${label}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      TLP:{label}
    </span>
  );
}
