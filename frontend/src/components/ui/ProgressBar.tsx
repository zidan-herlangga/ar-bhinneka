import { cn } from "../../lib/cn";

type Tone = "sky" | "warm" | "green" | "grape" | "coral";

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: Tone;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const tones: Record<Tone, string> = {
  sky: "from-sky to-sky-light",
  warm: "from-warm to-orange-400",
  green: "from-green to-emerald-400",
  grape: "from-grape to-fuchsia-400",
  coral: "from-coral to-rose-400",
};

export function ProgressBar({
  value,
  max = 100,
  tone = "sky",
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / Math.max(1, max)) * 100));

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-gray-500">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percent)}%</span>}
        </div>
      )}
      <div
        className="h-3 overflow-hidden rounded-full bg-sky/10 ring-1 ring-inset ring-white/70"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-500",
            tones[tone]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
