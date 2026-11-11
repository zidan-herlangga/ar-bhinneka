import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckSquare, Lightbulb, ListChecks,
  PenLine, RotateCcw, Sparkles, Star, Target, Trophy, X,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { EmptyState } from "../components/ui/EmptyState";
import { ProgressBar } from "../components/ui/ProgressBar";
import { usePlayerStore } from "../store/playerStore";
import { cn } from "../lib/cn";
import { playCorrect, playWrong, playSuccess } from "../lib/sound";
import { apiFetch, ApiError } from "../lib/api";
import { localQuiz } from "../data/localData";
import { PROVINCES } from "../data/provinces";

type QuestionType = "multiple_choice" | "yes_no" | "essay";

interface Question {
  id: string; type: QuestionType; category: string; question: string;
  options?: string[]; answer?: string; keywords?: string[]; sample_answer?: string; explanation?: string;
}
interface QuizData { province_id: string; province_name: string; region: string; total: number; summary: Record<QuestionType, number>; questions: Question[]; }
interface AnswerResult { type: QuestionType; correct: boolean; }

const CATEGORY_LABELS: Record<string, string> = {
  house: "Rumah Adat", clothing: "Pakaian Adat", dance: "Tarian",
  instrument: "Alat Musik", food: "Makanan Khas", art: "Seni & Kerajinan", province: "Wilayah & Ibu Kota",
};

const TYPE_META: Record<QuestionType, { label: string; icon: React.ReactNode; chip: string; tone: "sky" | "green" | "warm" }> = {
  multiple_choice: { label: "Pilihan Ganda", icon: <ListChecks className="h-4 w-4" />, chip: "bg-sky/10 text-sky-dark", tone: "sky" },
  yes_no: { label: "Ya / Tidak", icon: <CheckSquare className="h-4 w-4" />, chip: "bg-green/10 text-green-700", tone: "green" },
  essay: { label: "Isian Singkat", icon: <PenLine className="h-4 w-4" />, chip: "bg-warm/20 text-amber-700", tone: "warm" },
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function starsFor(score: number, total: number) {
  if (total === 0 || score === 0) return 0;
  if (score >= total * 0.8) return 3;
  if (score >= total * 0.6) return 2;
  return 1;
}

export function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useQuery<QuizData>({
    queryKey: ["quiz", id],
    queryFn: async () => {
      try {
        return await apiFetch<QuizData>(`/api/quiz?province_id=${id}`);
      } catch (err) {
        // Fallback ke generator lokal supaya kuis tetap bisa dimainkan saat backend offline.
        const province = PROVINCES.find((p) => p.id === id);
        if (!province) throw err;
        const local = localQuiz(province.id, province.name, province.region, PROVINCES);
        if (!local) throw err;
        return local;
      }
    },
    enabled: !!id,
    retry: 1,
  });

  const [stage, setStage] = useState<"intro" | "playing" | "finished">("intro");
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [essayText, setEssayText] = useState("");
  const [essayCorrect, setEssayCorrect] = useState(false);

  const addXp = usePlayerStore((s) => s.addXp);
  const playerId = usePlayerStore((s) => s.playerId);
  const setPlayerId = usePlayerStore((s) => s.setPlayerId);
  const nickname = usePlayerStore((s) => s.nickname);
  const avatar = usePlayerStore((s) => s.avatar);

  const questions = data?.questions ?? [];
  const total = questions.length;
  const summary = data?.summary ?? {
    multiple_choice: questions.filter((item) => item.type === "multiple_choice").length,
    yes_no: questions.filter((item) => item.type === "yes_no").length,
    essay: questions.filter((item) => item.type === "essay").length,
  };
  const q = questions[index];
  const score = results.filter((r) => r.correct).length;
  const isLast = index === total - 1;

  const resetAnswerState = () => { setAnswered(false); setSelected(null); setEssayText(""); setEssayCorrect(false); };
  const choose = (option: string) => {
    if (!q || answered) return;
    const correct = option === q.answer;
    setSelected(option);
    setAnswered(true);
    setResults((prev) => [...prev, { type: q.type, correct }]);
    if (correct) playCorrect(); else playWrong();
  };
  const submitEssay = () => {
    if (!q || answered || !essayText.trim()) return;
    const answer = normalize(essayText);
    const correct = (q.keywords ?? []).some((key) => answer.includes(normalize(key)));
    setEssayCorrect(correct);
    setAnswered(true);
    setResults((prev) => [...prev, { type: "essay", correct }]);
    if (correct) playCorrect(); else playWrong();
  };
  const selfMarkEssay = () => {
    if (essayCorrect) return;
    setEssayCorrect(true);
    playCorrect();
    setResults((prev) => {
      const next = [...prev];
      if (next.length > 0) next[next.length - 1] = { type: "essay", correct: true };
      return next;
    });
  };
  const restart = () => { setStage("intro"); setIndex(0); setResults([]); resetAnswerState(); };
  const saveResult = async (stars: number, xp: number) => {
    try {
      let pid = playerId && playerId !== "local" ? playerId : null;
      if (!pid) {
        const created = await apiFetch<{ id: string }>("/api/players", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nickname, avatar }) });
        pid = created.id;
        if (pid && pid !== "local") setPlayerId(pid);
      }
      if (pid && pid !== "local") {
        await apiFetch("/api/quiz-results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ player_id: pid, province_id: id, score, total, stars, xp }) });
      }
    } catch { /* ignore */ }
  };
  const handleNext = () => {
    if (!isLast) { setIndex((i) => i + 1); resetAnswerState(); return; }
    const stars = starsFor(score, total);
    const xp = score * 10;
    addXp(xp);
    usePlayerStore.setState((s) => ({ stars: s.stars + stars }));
    setStage("finished");
    playSuccess();
    void saveResult(stars, xp);
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-4" aria-label="Memuat kuis">
          <div className="h-40 animate-pulse rounded-2xl border border-sky/10 bg-gray-50" />
          <div className="h-72 animate-pulse rounded-2xl border border-sky/10 bg-gray-50" />
        </div>
      </section>
    );
  }

  if (isError || !data || total === 0) {
    const apiError = error instanceof ApiError ? error : null;
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          emoji="📡"
          title="Gagal memuat kuis"
          description={apiError ? `${apiError.message} ${apiError.hint ?? ""}` : "Pastikan server kuis sedang berjalan, lalu coba lagi."}
          action={<Link to="/peta"><Button>Kembali ke Peta</Button></Link>}
        />
      </section>
    );
  }

  if (stage === "intro") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        <Breadcrumb items={[{ label: "Peta", to: "/peta" }, { label: data.province_name, to: `/provinsi/${id}` }, { label: "Kuis" }]} />

        <Card className="overflow-hidden p-0">
          <div className="relative bg-primary-dark p-6 text-white">
            <div aria-hidden className="absolute inset-0 motif-light opacity-60" />
            <div className="relative text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-3xl" aria-hidden>📝</div>
              <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">Kuis {data.province_name}</h1>
              <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs font-bold">
                <span className="rounded-lg bg-white/20 px-3 py-1">{data.region}</span>
                <span className="rounded-lg bg-white/20 px-3 py-1">{data.total} soal</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(TYPE_META) as QuestionType[]).map((type) => {
                const meta = TYPE_META[type];
                return (
                  <div key={type} className={cn("rounded-xl p-3 text-center", meta.chip)}>
                    <div className="mx-auto grid h-8 w-8 place-items-center" aria-hidden>{meta.icon}</div>
                    <p className="font-display text-2xl font-extrabold leading-tight">{summary[type]}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider">{meta.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-sky/10 bg-ivory p-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
                <BookOpen className="h-5 w-5 text-sky-dark" aria-hidden /> Cara Bermain
              </h2>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-sky-dark" aria-hidden /><span><strong>{summary.multiple_choice} soal pilihan ganda</strong> — pilih satu jawaban yang benar.</span></li>
                <li className="flex gap-2"><CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden /><span><strong>{summary.yes_no} soal Ya / Tidak</strong> — pilih “Ya” atau “Tidak”.</span></li>
                <li className="flex gap-2"><PenLine className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden /><span><strong>{summary.essay} soal isian singkat</strong> — tulis jawaban singkat, lalu periksa dengan kata kunci.</span></li>
                <li className="flex gap-2"><Star className="mt-0.5 h-4 w-4 shrink-0 text-warm" aria-hidden /><span>Setiap jawaban benar = 1 poin dan +10 XP.</span></li>
                <li className="flex gap-2"><Trophy className="mt-0.5 h-4 w-4 shrink-0 text-warm" aria-hidden /><span>Kumpulkan bintang dengan menjawab banyak soal dengan benar.</span></li>
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-warm/30 bg-warm/10 p-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
                <Lightbulb className="h-5 w-5 text-warm" aria-hidden /> Yang akan kamu pelajari
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                Rumah adat, pakaian adat, tarian, alat musik, makanan khas, seni, ibu kota, dan wilayah {data.province_name}.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to={`/provinsi/${id}`}><Button variant="ghost"><ArrowLeft className="h-4 w-4" aria-hidden /> Kembali</Button></Link>
              <Button size="lg" onClick={() => setStage("playing")}>Mulai Kuis <Sparkles className="h-5 w-5" aria-hidden /></Button>
            </div>
          </div>
        </Card>
      </section>
    );
  }

  if (stage === "finished") {
    const stars = starsFor(score, total);
    const percentage = Math.round((score / total) * 100);
    const xp = score * 10;
    const typeTotals: Record<QuestionType, number> = { multiple_choice: 0, yes_no: 0, essay: 0 };
    const typeCorrect: Record<QuestionType, number> = { multiple_choice: 0, yes_no: 0, essay: 0 };
    questions.forEach((item) => { typeTotals[item.type] += 1; });
    results.forEach((item) => { if (item.correct) typeCorrect[item.type] += 1; });

    const mood = percentage === 100 ? "🏆" : percentage >= 80 ? "🌟" : percentage >= 60 ? "👍" : "💪";
    const message =
      percentage === 100 ? "Luar biasa! Semua jawaban benar!"
      : percentage >= 80 ? "Hebat sekali! Kamu sudah sangat paham."
      : percentage >= 60 ? "Bagus! Sedikit lagi jadi ahli budaya."
      : "Semangat! Coba jelajahi budaya provinsi ini lagi, ya.";

    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="motif-band mb-6" aria-hidden />
        <Card className="text-center">
          <div className="text-5xl" aria-hidden>{mood}</div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">Hasil Kuis</h1>
          <p className="mt-1 text-lg font-bold text-gray-700">{data.province_name}</p>

          <div className="relative mx-auto mt-5 h-36 w-36" aria-label={`Skor ${score} dari ${total}, ${percentage}% benar`}>
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1D4ED8" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${(percentage * 326.73) / 100} 326.73`} />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-display text-3xl font-extrabold leading-none text-ink">{score}/{total}</p>
                <p className="mt-1 text-xs font-bold text-gray-500">{percentage}% benar</p>
              </div>
            </div>
          </div>

          <p className="mt-3 text-2xl" aria-label={`${stars} dari 3 bintang`}>
            {"⭐".repeat(stars)}{"☆".repeat(Math.max(0, 3 - stars))}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-lg bg-sky/10 px-3 py-1 text-sm font-bold text-sky-dark">
            <Sparkles className="h-4 w-4" aria-hidden />+{xp} XP
          </p>
          <p className="mt-3 font-semibold text-gray-700">{message}</p>

          <div className="mt-5 rounded-xl border border-sky/10 bg-ivory p-4 text-left">
            <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-extrabold text-ink">
              <Target className="h-5 w-5 text-sky-dark" aria-hidden /> Rincian Jawaban
            </h2>
            <div className="space-y-2">
              {(Object.keys(TYPE_META) as QuestionType[]).map((type) => (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm font-bold text-gray-700">
                    <span className="inline-flex items-center gap-1.5">{TYPE_META[type].icon} {TYPE_META[type].label}</span>
                    <span>{typeCorrect[type]}/{typeTotals[type]}</span>
                  </div>
                  <ProgressBar className="mt-1" value={typeCorrect[type]} max={typeTotals[type] || 1} tone={TYPE_META[type].tone} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="ghost" onClick={restart}><RotateCcw className="h-4 w-4" aria-hidden /> Ulangi Kuis</Button>
            <Link to={`/provinsi/${id}`}><Button variant="secondary">Kembali</Button></Link>
            <Link to="/peta"><Button>Lanjut Jelajah <ArrowRight className="h-4 w-4" aria-hidden /></Button></Link>
          </div>
        </Card>
      </section>
    );
  }

  if (!q) return null;

  const meta = TYPE_META[q.type];
  const progress = Math.round(((index + (answered ? 1 : 0)) / total) * 100);

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 md:py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link to={`/provinsi/${id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-sky/20 bg-white px-3 py-2 text-sm font-bold text-sky-dark transition hover:bg-sky/5">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Keluar
        </Link>
        <span className="rounded-xl border border-sky/10 bg-white px-3 py-2 text-sm font-bold text-gray-600">
          Soal {index + 1} dari {total}
        </span>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-gray-500">
          <span className="inline-flex items-center gap-1"><Trophy className="h-4 w-4 text-warm" aria-hidden /> {score} benar</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold", meta.chip)}>
            {meta.icon} {meta.label}
          </span>
          {q.category && (
            <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
              {CATEGORY_LABELS[q.category] ?? q.category}
            </span>
          )}
        </div>

        <h2 className="mt-3 mb-4 font-display text-xl font-extrabold leading-snug text-ink md:text-2xl">{q.question}</h2>

        {q.type === "multiple_choice" && (
          <div className="grid gap-2">
            {q.options?.map((option, i) => {
              const isCorrect = answered && option === q.answer;
              const isWrong = answered && selected === option && option !== q.answer;
              return (
                <button key={option} onClick={() => choose(option)} disabled={answered}
                  className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-left font-semibold transition",
                    isCorrect ? "border-green bg-green/10" : isWrong ? "border-flag-red bg-flag-red/10" : "border-gray-200 bg-white hover:border-sky hover:bg-sky/5")}>
                  <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold",
                    isCorrect ? "bg-green text-white" : isWrong ? "bg-flag-red text-white" : "bg-sky/10 text-sky-dark")}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {isCorrect && <Check className="h-5 w-5 text-green-700" aria-hidden />}
                  {isWrong && <X className="h-5 w-5 text-flag-red" aria-hidden />}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "yes_no" && (
          <div className="grid grid-cols-2 gap-3">
            {["Ya", "Tidak"].map((option) => {
              const isCorrect = answered && option === q.answer;
              const isWrong = answered && selected === option && option !== q.answer;
              return (
                <button key={option} onClick={() => choose(option)} disabled={answered}
                  className={cn("rounded-xl border px-4 py-6 font-display text-lg font-extrabold transition",
                    isCorrect ? "border-green bg-green/10 text-green-700" : isWrong ? "border-flag-red bg-flag-red/10 text-flag-red" : "border-gray-200 bg-white hover:border-sky hover:bg-sky/5")}>
                  <span className="mb-1 block text-3xl" aria-hidden>{option === "Ya" ? "👍" : "👎"}</span>
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "essay" && (
          <div>
            <textarea value={essayText} onChange={(e) => setEssayText(e.target.value)} disabled={answered} rows={3} maxLength={200}
              placeholder="Tulis jawaban singkatmu di sini..."
              className="w-full rounded-xl border border-gray-200 bg-white p-3 font-semibold text-ink outline-none transition focus:border-sky disabled:bg-gray-50" />
            {!answered ? (
              <Button className="mt-3" onClick={submitEssay} disabled={!essayText.trim()}>
                <Check className="h-4 w-4" aria-hidden /> Periksa Jawaban
              </Button>
            ) : (
              <div className="mt-3 space-y-2">
                {essayCorrect ? (
                  <p className="inline-flex items-center gap-1 rounded-lg bg-green/10 px-3 py-1 text-sm font-bold text-green-700">
                    <Check className="h-4 w-4" aria-hidden /> Jawabanmu cocok!
                  </p>
                ) : (
                  <>
                    <p className="inline-flex items-center gap-1 rounded-lg bg-flag-red/10 px-3 py-1 text-sm font-bold text-flag-red">
                      <X className="h-4 w-4" aria-hidden /> Belum cocok dengan kata kunci.
                    </p>
                    <p className="rounded-xl border border-sky/10 bg-ivory p-3 text-sm text-gray-700">
                      Contoh jawaban: <strong>{q.sample_answer}</strong>
                    </p>
                    <Button variant="ghost" size="sm" onClick={selfMarkEssay}>Jawabanku ternyata benar</Button>
                  </>
                )}
                {q.explanation && <p className="text-sm text-gray-500">{q.explanation}</p>}
              </div>
            )}
          </div>
        )}

        {answered && q.type !== "essay" && q.explanation && (
          <p className="mt-4 flex gap-2 rounded-xl border border-sky/10 bg-ivory p-3 text-sm text-gray-600">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warm" aria-hidden />
            <span>{q.explanation}</span>
          </p>
        )}

        {answered && (
          <div className="mt-5 flex justify-end">
            <Button onClick={handleNext}>
              {isLast ? (<>Lihat Hasil <Star className="h-4 w-4" aria-hidden /></>) : (<>Lanjut <ArrowRight className="h-4 w-4" aria-hidden /></>)}
            </Button>
          </div>
        )}
      </Card>
    </section>
  );
}
