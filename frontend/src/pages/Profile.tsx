import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2, History, MapPin, Star, Target, Trophy, User, Zap } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { SectionTitle } from "../components/ui/SectionTitle";
import { StatTile } from "../components/ui/StatTile";
import { EmptyState } from "../components/ui/EmptyState";
import { usePlayerStore } from "../store/playerStore";
import { PROVINCES } from "../data/provinces";
import { apiUrl } from "../lib/api";

interface QuizHistory { province_id: string; score: number; total: number; stars: number; xp: number; }
function provinceName(id: string) { return PROVINCES.find((p) => p.id === id)?.name ?? id; }

export function Profile() {
  const { nickname, avatar, level, xp, stars, playerId } = usePlayerStore();

  const { data: history, isLoading } = useQuery<QuizHistory[]>({
    queryKey: ["quiz-results", playerId],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/quiz-results?player_id=${playerId}`));
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!playerId && playerId !== "local",
  });

  const levelProgress = xp % 100;
  const quizCount = history?.length ?? 0;

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 md:py-8">
      <PageHeader icon={<User className="h-6 w-6" />} title="Profil Pemain" subtitle="Lihat level, XP, bintang, dan riwayat kuis yang sudah kamu selesaikan."
        action={<Link to="/pengaturan"><Button variant="ghost" size="sm">Ubah Profil</Button></Link>} />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-sky/10 text-4xl" aria-hidden>{avatar}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Pahlawan Budaya</p>
            <p className="font-display text-2xl font-extrabold text-ink">{nickname}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-gray-600">
              <span className="rounded-lg bg-sky/10 px-2.5 py-1 text-sky-dark">Level {level}</span>
              <span className="rounded-lg bg-gray-50 px-2.5 py-1">{xp} XP</span>
              <span className="rounded-lg bg-warm/20 px-2.5 py-1 text-amber-700">{stars} bintang</span>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Menuju Level {level + 1}</span><span>{levelProgress}/100 XP</span>
          </div>
          <ProgressBar value={levelProgress} />
        </div>
      </Card>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={<Zap className="h-5 w-5" />} label="Level" value={level} tone="sky" />
        <StatTile icon={<Target className="h-5 w-5" />} label="Total XP" value={xp} tone="sky" />
        <StatTile icon={<Star className="h-5 w-5" />} label="Bintang" value={stars} tone="warm" />
        <StatTile icon={<Gamepad2 className="h-5 w-5" />} label="Kuis Selesai" value={quizCount} tone="sky" />
      </div>

      <SectionTitle icon={<History className="h-5 w-5" />} title="Riwayat Kuis" subtitle="Setiap kuis yang selesai akan tercatat di sini."
        action={<Link to="/peta" className="inline-flex items-center gap-1 text-sm font-bold text-sky-dark">Kuis Baru <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />

      {isLoading && (
        <div className="grid gap-3" aria-label="Memuat riwayat kuis">
          {[0, 1].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-sky/10 bg-gray-50" />)}
        </div>
      )}

      {!isLoading && quizCount === 0 && (
        <EmptyState emoji="🏁" title="Belum ada riwayat kuis" description="Selesaikan kuis pertamamu untuk mengumpulkan XP dan bintang."
          action={<Link to="/peta"><Button><Trophy className="h-4 w-4" aria-hidden /> Mulai Kuis</Button></Link>} />
      )}

      <div className="grid gap-3">
        {history?.map((h, i) => (
          <Card key={`${h.province_id}-${i}`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky/10 text-sky-dark" aria-hidden><MapPin className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-extrabold text-ink">{provinceName(h.province_id)}</p>
                <p className="text-sm font-semibold text-gray-600">Skor {h.score}/{h.total} • +{h.xp} XP</p>
              </div>
              <div className="text-lg" aria-label={`${h.stars} bintang`}>
                {"⭐".repeat(h.stars)}{"☆".repeat(Math.max(0, 3 - h.stars))}
              </div>
            </div>
            <ProgressBar className="mt-3" value={h.score} max={h.total} tone={h.score >= h.total * 0.8 ? "green" : "sky"} />
          </Card>
        ))}
      </div>

      <p className="mt-8 rounded-xl border border-sky/10 bg-gray-50 p-4 text-center text-xs font-semibold text-gray-500">
        🔒 Data disimpan secara lokal di perangkatmu. Tidak ada data pribadi yang dikumpulkan.
      </p>
    </section>
  );
}
