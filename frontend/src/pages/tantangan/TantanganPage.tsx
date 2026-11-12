import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2, Layers, Lightbulb, Puzzle, Sparkles } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { readBestScores, type GameId } from "../../lib/tantangan";

interface GameEntry {
  id: GameId;
  to: string;
  title: string;
  desc: string;
  icon: typeof Puzzle;
  chip: string;
}

const games: GameEntry[] = [
  {
    id: "jodohkan",
    to: "/tantangan/jodohkan",
    title: "Jodohkan Budaya",
    desc: "Tebak provinsi asal dari rumah adat, tarian, atau makanan yang muncul.",
    icon: Puzzle,
    chip: "bg-teal/10 text-teal-dark",
  },
  {
    id: "ingatan",
    to: "/tantangan/ingatan",
    title: "Kartu Ingatan",
    desc: "Balik kartu dan pasangkan nama budaya dengan provinsi asalnya.",
    icon: Layers,
    chip: "bg-warm/20 text-amber-900",
  },
  {
    id: "petunjuk",
    to: "/tantangan/petunjuk",
    title: "Tebak dari Petunjuk",
    desc: "Baca ciri-cirinya, lalu tebak nama budaya yang dimaksud.",
    icon: Lightbulb,
    chip: "bg-green/10 text-green-700",
  },
];

export function TantanganPage() {
  const best = readBestScores();

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 md:py-8">
      <PageHeader
        eyebrow="Mini-game"
        title="Tantangan Budaya"
        subtitle="Tiga permainan singkat untuk menguji ingatanmu tentang budaya Nusantara. Semua tanpa perlu unduh apa pun."
        icon={<Gamepad2 className="h-6 w-6" />}
        accent="#247C83"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {games.map((game) => (
          <Link key={game.id} to={game.to} className="group block h-full">
            <Card interactive className="relative flex h-full flex-col overflow-hidden">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-primary-dark transition-transform duration-300 group-hover:scale-x-100"
              />
              <span
                className={`grid h-11 w-11 place-items-center rounded-xl ${game.chip}`}
                aria-hidden
              >
                <game.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-display text-lg font-extrabold text-ink transition-colors group-hover:text-sky-dark">
                {game.title}
              </h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-gray-600">{game.desc}</p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-extrabold text-muted">
                  {best[game.id] ? `Rekor ${best[game.id]} XP` : "Belum dimainkan"}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-extrabold text-sky-dark">
                  Main <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <SectionTitle
        icon={<Sparkles className="h-5 w-5" />}
        title="Kenapa pakai tantangan?"
        subtitle="Latihan singkat agar budaya yang kamu baca di peta lebih mudah diingat."
      />
      <Card>
        <ul className="space-y-2 text-sm leading-relaxed text-gray-700">
          <li>
            <strong>Soal diacak setiap kali main</strong>, jadi tidak bisa sekadar menghafal urutan.
          </li>
          <li>
            <strong>Setiap jawaban benar menambah XP</strong> untuk menaikkan level profilmu.
          </li>
          <li>
            <strong>Rekor tersimpan di perangkat</strong>, jadi kamu bisa memantau kemajuan sendiri.
          </li>
        </ul>
      </Card>
    </section>
  );
}
