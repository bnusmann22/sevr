import { motion, useReducedMotion } from "framer-motion";
import { Check, LockKeyhole, ScanLine, ShieldCheck } from "lucide-react";
import Logo from "./Logo";

type LoadingPageProps = {
  message?: string;
};

export default function LoadingPage({ message = "Opening your secure workspace" }: LoadingPageProps) {
  const shouldReduceMotion = useReducedMotion();

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: shouldReduceMotion ? 0 : 0.55,
      delay: shouldReduceMotion ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });

  return (
    <main
      className="loading-page relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071516] px-4 py-10 text-[#e9f4ef] sm:px-6"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative flex w-full max-w-[27rem] flex-col items-center text-center">
        <motion.div {...reveal(0)}>
          <Logo
            size="lg"
            showSubtitle
            markClassName="bg-teal-300 text-[#071516]"
            nameClassName="text-[#e9f4ef]"
            subtitleClassName="text-teal-200/60"
          />
        </motion.div>

        <motion.div
          {...reveal(0.12)}
          className="loading-media relative mt-10 aspect-[16/10] w-full overflow-hidden rounded-[1.25rem] border border-teal-100/15 bg-[#0b2021] shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
          aria-hidden="true"
        >
          <img
            src="/assets/sevr_container_diagram.jpg"
            alt=""
            className="h-full w-full object-cover object-[46%_50%] opacity-55"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(7,21,22,0.9),rgba(7,21,22,0.25)_45%,rgba(7,21,22,0.8))]" />
          <div className="loading-scan absolute inset-x-0 top-0 h-px bg-teal-200/80 shadow-[0_0_18px_3px_rgba(94,234,212,0.45)]" />
          <div className="absolute inset-x-5 bottom-4 flex items-center justify-between border-t border-teal-100/15 pt-3 text-left font-mono text-[9px] uppercase tracking-[0.16em] text-teal-100/65 sm:inset-x-6">
            <span className="flex items-center gap-2"><ScanLine className="h-3 w-3 text-teal-300" /> Payload map</span>
            <span>SEVR / 01</span>
          </div>
        </motion.div>

        <motion.div {...reveal(0.25)} className="mt-7 flex w-full items-center gap-3 text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-teal-300/35 bg-teal-300/10 text-teal-200">
            <LockKeyhole className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-teal-50">{message}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-teal-200/45">Establishing trusted session</p>
          </div>
          <ShieldCheck className="h-5 w-5 shrink-0 text-teal-300" />
        </motion.div>

        <motion.div {...reveal(0.36)} className="mt-6 flex w-full items-center justify-between border-t border-teal-100/10 pt-4 text-[10px] font-medium uppercase tracking-[0.17em] text-teal-100/45">
          <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-300" /> Identity verified</span>
          <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-300" /> Enclave ready</span>
        </motion.div>
      </div>
    </main>
  );
}