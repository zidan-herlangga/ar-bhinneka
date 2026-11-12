import { useState } from "react";
import { Quote } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { AnswerFeedback, GameResult, GameShell } from "../../components/tantangan/GameUI";
import {
  CATEGORY_LABELS,
  buildPetunjukRounds,
  saveBestScore,
  type PetunjukRound,
} from "../../lib/tantangan";
import { usePlayerStore } from "../../store/playerStore";
import { cn } from "../../lib/cn";

const TOTAL = 8;
const LETTERS = ["A", "B", "C", "D"];

export function PetunjukPage() {
  const addXp = usePlayerStore((s) => s.addXp);

  const [rounds, setRounds] = useState<PetunjukRound[]>(() => buildPetunjukRounds(TOTAL));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [best, setBest] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = rounds[index];
  const answered = selected !== null;
  const isCorrect = selected === round.culture.name;

  const choose = (name: string) => {
    if (answered) return;
    setSelected(name);
    if (name === round.culture.name) setCorrect((value) => value + 1);
  };

  const next = () => {
    if (index + 1 < rounds.length) {
      setIndex((value) => value + 1);
      setSelected(null);
      return;
    }
    const earned = correct * 5;
    setXp(earned);
    addXp(earned);
    setBest(saveBestScore("petunjuk", earned));
    setFinished(true);
  };

  const replay = () => {
    setRounds(buildPetunjukRounds(TOTAL));
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setXp(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <GameShell title="Tebak dari Petunjuk" subtitle="Baca ciri-cirinya, lalu tebak namanya.">
        <GameResult
          correct={correct}
          total={rounds.length}
          xp={xp}
          best={best}
          onReplay={replay}
        />
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Tebak dari Petunjuk"
      subtitle="Budaya apa yang cocok dengan ciri-ciri berikut?"
      current={index}
      total={rounds.length}
      score={correct}
    >
      <Card className="border-l-4 border-l-sky">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-sky-dark">
          {CATEGORY_LABELS[round.culture.category] ?? "Budaya"}
        </span>
        <div className="mt-3 flex gap-2">
          <Quote className="mt-0.5 h-5 w-5 shrink-0 text-sky/40" aria-hidden />
          <p className="font-display text-lg font-bold leading-relaxed text-ink md:text-xl">
            {round.culture.description}
          </p>
        </div>
      </Card>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {round.options.map((name, i) => {
          const isAnswer = name === round.culture.name;
          const isPicked = name === selected;
          return (
            <button
              key={name}
              type="button"
              disabled={answered}
              aria-pressed={isPicked}
              onClick={() => choose(name)}
              className={cn(
                "btn-touch flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-display text-base font-extrabold transition",
                !answered && "border-sky/15 bg-white text-ink hover:border-sky/40 hover:bg-sky/5 active:scale-[0.99]",
                answered && isAnswer && "border-green bg-green/10 text-green-800",
                answered && isPicked && !isAnswer && "border-flag-red bg-flag-red/10 text-flag-red",
                answered && !isAnswer && !isPicked && "border-sky/10 bg-white text-gray-400"
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm",
                  answered && isAnswer
                    ? "bg-green text-white"
                    : answered && isPicked
                      ? "bg-flag-red text-white"
                      : "bg-sky/10 text-sky-dark"
                )}
                aria-hidden
              >
                {LETTERS[i]}
              </span>
              <span className="flex-1">{name}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <AnswerFeedback
          correct={isCorrect}
          explanation={`${round.culture.name} adalah ${
            (CATEGORY_LABELS[round.culture.category] ?? "budaya").toLowerCase()
          } khas ${round.province.name}.`}
          onNext={next}
          nextLabel={index + 1 < rounds.length ? "Soal Berikutnya" : "Lihat Hasil"}
        />
      )}
    </GameShell>
  );
}
