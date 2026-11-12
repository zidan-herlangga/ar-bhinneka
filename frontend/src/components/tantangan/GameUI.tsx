import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";

import { Breadcrumb } from "../ui/Breadcrumb";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { cn } from "../../lib/cn";

interface GameShellProps {
  title: string;
  subtitle: string;
  current?: number;
  total?: number;
  score?: number;
  scoreLabel?: string;
  children: ReactNode;
}

export function GameShell({
  title,
  subtitle,
  current,
  total,
  score,
  scoreLabel = "benar",
  children,
}: GameShellProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Tantangan", to: "/tantangan" }, { label: title }]} />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold leading-tight text-ink md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        </div>
        {typeof score === "number" && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-warm/20 px-3 py-1.5 text-sm font-extrabold text-amber-900">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
            {score} {scoreLabel}
          </span>
        )}
      </div>

      {typeof current === "number" && typeof total === "number" && (
        <ProgressBar
          value={current}
          max={total}
          label={`Soal ${Math.min(current + 1, total)} dari ${total}`}
          className="mb-5"
        />
      )}

      {children}
    </section>
  );
}

interface AnswerFeedbackProps {
  correct: boolean;
  explanation: string;
  onNext: () => void;
  nextLabel: string;
}

export function AnswerFeedback({
  correct,
  explanation,
  onNext,
  nextLabel,
}: AnswerFeedbackProps) {
  return (
    <div
      role="status"
      className={cn(
        "pop mt-4 rounded-xl border p-4",
        correct ? "border-green/30 bg-green/10" : "border-flag-red/25 bg-flag-red/5"
      )}
    >
      <p
        className={cn(
          "flex items-center gap-2 font-display text-base font-extrabold",
          correct ? "text-green-700" : "text-flag-red"
        )}
      >
        {correct ? (
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        ) : (
          <XCircle className="h-5 w-5" aria-hidden />
        )}
        {correct ? "Tepat sekali!" : "Belum tepat"}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-gray-700">{explanation}</p>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={onNext}>
          {nextLabel} <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

interface GameResultProps {
  correct: number;
  total: number;
  xp: number;
  best: number;
  onReplay: () => void;
}

export function GameResult({ correct, total, xp, best, onReplay }: GameResultProps) {
  const navigate = useNavigate();
  const percent = Math.round((correct / Math.max(1, total)) * 100);
  const perfect = correct === total;

  return (
    <Card className="pop text-center">
      <div
        className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-warm/20 text-3xl"
        aria-hidden
      >
        {perfect ? "🏆" : percent >= 60 ? "🌟" : "💪"}
      </div>
      <h2 className="mt-3 font-display text-2xl font-extrabold text-ink">
        Tantangan Selesai
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        {correct} dari {total} benar · {percent}%
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm font-extrabold">
        <span className="rounded-lg bg-warm/20 px-3 py-1 text-amber-900">+{xp} XP</span>
        <span className="rounded-lg bg-sky/10 px-3 py-1 text-sky-dark">Rekor: {best} XP</span>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onReplay}>
          <RotateCcw className="h-4 w-4" aria-hidden /> Main Lagi
        </Button>
        <Button variant="ghost" onClick={() => navigate("/tantangan")}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Pilih Tantangan
        </Button>
      </div>
    </Card>
  );
}
