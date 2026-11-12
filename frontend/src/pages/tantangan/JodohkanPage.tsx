import { useState } from "react";
import { MapPin } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { AnswerFeedback, GameResult, GameShell } from "../../components/tantangan/GameUI";
import {
  CATEGORY_LABELS,
  buildJodohkanRounds,
  saveBestScore,
  type JodohkanRound,
} from "../../lib/tantangan";
import { usePlayerStore } from "../../store/playerStore";
import { cn } from "../../lib/cn";

const TOTAL = 8;
const LETTERS = ["A", "B", "C", "D"];

export function JodohkanPage() {
  const addXp = usePlayerStore((s) => s.addXp);

  const [rounds, setRounds] = useState<JodohkanRound[]>(() => buildJodohkanRounds(TOTAL));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [best, setBest] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = rounds[index];
  const answered = selected !== null;
  const isCorrect = selected === round.province.id;

  const choose = (id: string) => {
    if (answered) return;
    setSelected(id);
    if (id === round.province.id) setCorrect((value) => value + 1);
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
    setBest(saveBestScore("jodohkan", earned));
    setFinished(true);
  };

  const replay = () => {
    setRounds(buildJodohkanRounds(TOTAL));
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setXp(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <GameShell title="Jodohkan Budaya" subtitle="Cocokkan budaya dengan provinsi asalnya.">
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
      title="Jodohkan Budaya"
      subtitle="Dari provinsi mana budaya ini berasal?"
      current={index}
      total={rounds.length}
      score={correct}
    >
      <Card className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-sky-dark">
          {CATEGORY_LABELS[round.culture.category] ?? "Budaya"}
        </span>
        <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-ink md:text-3xl">
          {round.culture.name}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Budaya ini berasal dari provinsi mana?
        </p>
      </Card>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {round.options.map((option, i) => {
          const isAnswer = option.id === round.province.id;
          const isPicked = option.id === selected;
          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              aria-pressed={isPicked}
              onClick={() => choose(option.id)}
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
              <span className="flex-1">{option.name}</span>
              {answered && isAnswer && <MapPin className="h-4 w-4 shrink-0" aria-hidden />}
            </button>
          );
        })}
      </div>

      {answered && (
        <AnswerFeedback
          correct={isCorrect}
          explanation={`${round.culture.name} adalah ${
            (CATEGORY_LABELS[round.culture.category] ?? "budaya").toLowerCase()
          } khas ${round.province.name}. ${round.culture.description}`}
          onNext={next}
          nextLabel={index + 1 < rounds.length ? "Soal Berikutnya" : "Lihat Hasil"}
        />
      )}
    </GameShell>
  );
}
