import { Check, Lock, Trophy } from "lucide-react";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { usePlayerStore } from "../store/playerStore";
import { cn } from "../lib/cn";

const badges = [
  {
    emoji: "🌱",
    name: "Langkah Pertama",
    desc: "Kumpulkan 1 bintang",
    required: 1,
  },
  {
    emoji: "🏠",
    name: "Penjelajah Rumah",
    desc: "Kumpulkan 3 bintang",
    required: 3,
  },
  {
    emoji: "💃",
    name: "Penari Cilik",
    desc: "Kumpulkan 5 bintang",
    required: 5,
  },
  {
    emoji: "🎵",
    name: "Musisi Nusantara",
    desc: "Kumpulkan 8 bintang",
    required: 8,
  },
  {
    emoji: "🍜",
    name: "Koki Budaya",
    desc: "Kumpulkan 12 bintang",
    required: 12,
  },
  {
    emoji: "🏆",
    name: "Juara Nusantara",
    desc: "Kumpulkan 20 bintang",
    required: 20,
  },
];

export function Achievements() {
  const stars = usePlayerStore((s) => s.stars);
  const unlocked = badges.filter((b) => stars >= b.required).length;
  const next = badges.find((b) => stars < b.required);

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 md:py-8">
      <PageHeader
        icon={<Trophy className="h-6 w-6" />}
        title="Pencapaian"
        subtitle="Kumpulkan bintang dari kuis untuk membuka lencana budaya satu per satu."
      />

      <Card className="mb-6 border-warm/30 bg-warm/10">
        <div className="flex flex-wrap items-center gap-4">
          <div
            className="grid h-14 w-14 place-items-center rounded-2xl bg-white"
            aria-hidden
          >
            <img
              src="/assets/icons/pencapaian.webp"
              alt=""
              className="h-10 w-10 object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
              Progres Lencana
            </p>
            <p className="font-display text-2xl font-extrabold text-ink">
              {unlocked} / {badges.length} terbuka
            </p>
            <p className="mt-1 text-sm font-bold text-gray-600">
              {stars} bintang terkumpul
            </p>
          </div>
          {next && (
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-600">
              {next.required - stars} bintang lagi untuk “{next.name}”
            </span>
          )}
        </div>
        <ProgressBar
          className="mt-4"
          value={unlocked}
          max={badges.length}
          tone="warm"
          label="Lencana terbuka"
          showValue
        />
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => {
          const isUnlocked = stars >= b.required;
          return (
            <Card
              key={b.name}
              className={
                isUnlocked ? "border-green/20 bg-green/5" : "bg-gray-50"
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-xl bg-white shadow-sm",
                    !isUnlocked && "grayscale opacity-60",
                  )}
                  aria-hidden
                >
                  <img
                    src="/assets/icons/pencapaian.webp"
                    alt=""
                    className="h-8 w-8 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                    isUnlocked
                      ? "bg-green/10 text-green-700"
                      : "bg-gray-200 text-gray-500",
                  )}
                >
                  {isUnlocked ? (
                    <>
                      <Check className="h-3 w-3" aria-hidden /> Terbuka
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" aria-hidden /> Terkunci
                    </>
                  )}
                </span>
              </div>
              <h2 className="mt-3 font-display text-lg font-extrabold text-ink">
                {b.name}
              </h2>
              <p className="mt-0.5 text-sm text-gray-600">{b.desc}</p>
              {!isUnlocked && (
                <ProgressBar
                  className="mt-3"
                  value={stars}
                  max={b.required}
                  tone="warm"
                  label={`${stars}/${b.required} bintang`}
                />
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-sky/10 bg-gray-50 p-4 text-center text-sm font-semibold text-gray-500">
        <Trophy className="h-4 w-4 text-warm" aria-hidden /> Selesaikan kuis
        dengan skor tinggi untuk mendapat lebih banyak bintang.
      </p>
    </section>
  );
}
