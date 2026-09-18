import { Shield } from "lucide-react";

type LogoSize = "sm" | "md" | "lg";

type LogoProps = {
  size?: LogoSize;
  showSubtitle?: boolean;
  showVersion?: boolean;
  className?: string;
  markClassName?: string;
  nameClassName?: string;
  subtitleClassName?: string;
  versionClassName?: string;
};

const sizeStyles: Record<LogoSize, { mark: string; icon: string; name: string; subtitle: string }> = {
  sm: {
    mark: "h-8 w-8 rounded-md",
    icon: "h-4 w-4",
    name: "text-sm tracking-[0.2em]",
    subtitle: "text-[10px]",
  },
  md: {
    mark: "h-9 w-9 rounded-lg",
    icon: "h-4 w-4",
    name: "text-sm tracking-[0.22em]",
    subtitle: "text-[10px]",
  },
  lg: {
    mark: "h-9 w-9 rounded-xl",
    icon: "h-4 w-4",
    name: "text-base tracking-tight",
    subtitle: "text-[10px]",
  },
};

export default function Logo({
  size = "md",
  showSubtitle = false,
  showVersion = false,
  className = "",
  markClassName = "bg-emerald-500 text-slate-950",
  nameClassName = "text-white",
  subtitleClassName = "text-zinc-400",
  versionClassName = "bg-zinc-900 border-zinc-700 text-zinc-300",
}: LogoProps) {
  const styles = sizeStyles[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={`flex items-center justify-center ${markClassName} ${styles.mark}`}>
        <Shield className={styles.icon} />
      </span>
      <div>
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${nameClassName} ${styles.name}`}>SeVR</span>
          {showVersion && <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ${versionClassName}`}>v1.0</span>}
        </div>
        {showSubtitle && (
          <p className={`font-mono uppercase tracking-wider ${subtitleClassName} ${styles.subtitle}`}>
            Scoped Enclave for Varsity Research
          </p>
        )}
      </div>
    </div>
  );
}