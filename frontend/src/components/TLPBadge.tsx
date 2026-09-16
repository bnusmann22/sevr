import type { TLPLabel } from "../types";

const STYLES: Record<TLPLabel, string> = {
  WHITE: "bg-neutral-100 text-neutral-700 border-neutral-300",
  GREEN: "bg-green-50 text-green-700 border-green-300",
  AMBER: "bg-amber-50 text-amber-700 border-amber-300",
  RED: "bg-red-50 text-red-700 border-red-300",
};

export default function TLPBadge({ label }: { label: TLPLabel }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${STYLES[label]}`}>
      TLP:{label}
    </span>
  );
}
