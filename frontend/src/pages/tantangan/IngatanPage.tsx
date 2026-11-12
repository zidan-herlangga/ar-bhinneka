import { useEffect, useRef, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { GameResult, GameShell } from "../../components/tantangan/GameUI";
import { buildMemoryDeck, saveBestScore, type MemoryCard } from "../../lib/tantangan";
import { usePlayerStore } from "../../store/playerStore";
import { cn } from "../../lib/cn";

const PAIRS = 6;

export function IngatanPage() {
  const addXp = usePlayerStore((s) => s.addXp);

  const [deck, setDeck] = useState<MemoryCard[]>(() => buildMemoryDeck(PAIRS));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [xp, setXp] = useState(0);
  const [best, setBest] = useState(0);
  const [finished, setFinished] = useState(false);

  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    []
  );

  const finish = (pairsFound: number, totalMoves: number) => {
    const earned = Math.max(10, 80 - totalMoves * 5);
    setXp(earned);
    addXp(earned);
    setBest(saveBestScore("ingatan", earned));
    setFinished(pairsFound === deck.length / 2);
  };

  const flip = (card: MemoryCard) => {
    if (lock || finished) return;
    if (flipped.includes(card.id) || matched.includes(card.pairId)) return;

    const nextFlipped = [...flipped, card.id];
    setFlipped(nextFlipped);

    if (nextFlipped.length < 2) return;

    const first = deck.find((c) => c.id === nextFlipped[0]);
    const second = deck.find((c) => c.id === nextFlipped[1]);
    if (!first || !second) return;

    const totalMoves = moves + 1;
    setMoves(totalMoves);
    setLock(true);

    if (first.pairId === second.pairId) {
      const nextMatched = [...matched, first.pairId];
      setMatched(nextMatched);
      setFlipped([]);
      setLock(false);
      if (nextMatched.length === deck.length / 2) finish(nextMatched.length, totalMoves);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      setFlipped([]);
      setLock(false);
    }, 900);
  };

  const replay = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setDeck(buildMemoryDeck(PAIRS));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
    setXp(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <GameShell title="Kartu Ingatan" subtitle="Pasangkan budaya dengan provinsi asalnya.">
        <GameResult
          correct={matched.length}
          total={deck.length / 2}
          xp={xp}
          best={best}
          onReplay={replay}
        />
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Kartu Ingatan"
      subtitle="Balik dua kartu dan pasangkan nama budaya dengan provinsinya."
      score={matched.length}
      scoreLabel="pasang"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-gray-600">
          Langkah: <span className="text-ink">{moves}</span> · Ditemukan:{" "}
          <span className="text-ink">
            {matched.length}/{deck.length / 2} pasang
          </span>
        </p>
        <Button variant="ghost" size="sm" onClick={replay}>
          <RotateCcw className="h-4 w-4" aria-hidden /> Acak Ulang
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {deck.map((card) => {
          const isMatched = matched.includes(card.pairId);
          const faceUp = flipped.includes(card.id) || isMatched;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(card)}
              disabled={faceUp}
              aria-label={faceUp ? `${card.kind}: ${card.label}` : "Kartu tertutup"}
              className="relative h-24 w-full [perspective:800px] sm:h-28"
            >
              <span
                className={cn(
                  "absolute inset-0 transition-transform duration-300 [transform-style:preserve-3d]",
                  faceUp && "[transform:rotateY(180deg)]"
                )}
              >
                <span className="absolute inset-0 grid place-items-center overflow-hidden rounded-xl border-2 border-primary-dark/30 bg-primary-dark text-white [backface-visibility:hidden]">
                  <span aria-hidden className="motif-light absolute inset-0 opacity-40" />
                  <Sparkles className="relative h-6 w-6" aria-hidden />
                </span>
                <span
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    isMatched ? "border-green bg-green/10" : "border-sky/30 bg-white"
                  )}
                >
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted">
                    {card.kind}
                  </span>
                  <span className="font-display text-xs font-extrabold leading-tight text-ink sm:text-sm">
                    {card.label}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
