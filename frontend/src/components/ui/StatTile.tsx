import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Tone = "sky" | "warm" | "green" | "grape" | "coral";

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tone?: Tone;
  className?: string;
}

const tones: Record<Tone, string> = {
  sky: "bg-sky/10 text-sky-dark",
  warm: "bg-warm/15 text-amber-600",
  green: "bg-green/10 text-green-700",
  grape: "bg-grape/10 text-grape",
  coral: "bg-coral/10 text-coral",
};

export function StatTile({ icon, label, value, tone = "sky", className }: StatTileProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 border-white bg-white/80 p-3 shadow-sm ring-1 ring-sky/5",
        className
      )}
    >
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
          tones[tone]
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
          {label}
        </span>
        <span className="block truncate font-display text-lg font-extrabold leading-tight text-ink">
          {value}
        </span>
      </span>
    </div>
  );
}
