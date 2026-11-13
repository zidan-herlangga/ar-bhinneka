import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, Home, MapPin, Music, Palette, PersonStanding, Shirt, Sparkles, Utensils } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionTitle } from "../components/ui/SectionTitle";
import { PROVINCES, REGION_ISLAND_LABELS, REGION_COLORS } from "../data/provinces";
import { apiFetch, ApiError } from "../lib/api";
import { localCultures } from "../data/localData";

interface Culture { id: string; province_id: string; category: string; name: string; description: string; source: string; }

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  house: { label: "Rumah Adat", icon: <Home className="h-5 w-5" />, color: "#D97706" },
  clothing: { label: "Pakaian Adat", icon: <Shirt className="h-5 w-5" />, color: "#DB2777" },
  dance: { label: "Tarian", icon: <PersonStanding className="h-5 w-5" />, color: "#7C3AED" },
  instrument: { label: "Alat Musik", icon: <Music className="h-5 w-5" />, color: "#2563EB" },
  food: { label: "Makanan Khas", icon: <Utensils className="h-5 w-5" />, color: "#16A34A" },
  art: { label: "Seni & Kerajinan", icon: <Palette className="h-5 w-5" />, color: "#CA8A04" },
};
const fallbackMeta = { label: "Budaya", icon: <Sparkles className="h-5 w-5" />, color: "#2563EB" };

export function ProvincePage() {
  const { id } = useParams<{ id: string }>();
  const province = PROVINCES.find((p) => p.id === id);

  const { data, isLoading, isError, error, refetch } = useQuery<{
    cultures: Culture[];
    offline: boolean;
  }>({
    queryKey: ["cultures", id],
    queryFn: async () => {
      try {
        const cultures = await apiFetch<Culture[]>(`/api/cultures?province_id=${id}`);
        return { cultures, offline: false };
      } catch (err) {
        // Fallback ke data lokal agar aplikasi tetap bisa dipakai saat backend offline.
        const local = localCultures(id ?? "");
        if (local.length === 0) throw err;
        return { cultures: local, offline: true };
      }
    },
    enabled: !!id,
    retry: 1,
  });

  const cultures = data?.cultures;
  const offline = data?.offline ?? false;
  const apiError = error instanceof ApiError ? error : null;

  if (!province) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <EmptyState emoji="🧭" title="Provinsi tidak ditemukan" description="Yuk kembali ke peta dan pilih provinsi lain."
          action={<Link to="/peta"><Button>Kembali ke Peta</Button></Link>} />
      </section>
    );
  }

  const color = REGION_COLORS[province.region];
  const islandKey = province.region === "BaliNusaTenggara" ? "bali" : province.region.toLowerCase();
  const islandImg = `/assets/maps/pulau-${islandKey}.webp`;

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 md:py-8">
      <Breadcrumb items={[
        { label: "Peta", to: "/peta" },
        { label: REGION_ISLAND_LABELS[province.region], to: `/pulau/${province.region}` },
        { label: province.name },
      ]} />

      <div className="relative mb-8 overflow-hidden rounded-2xl bg-teal p-6 text-white">
        <div aria-hidden className="absolute inset-0 motif-light opacity-50" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1.5" style={{ backgroundColor: color }} />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">Provinsi di {REGION_ISLAND_LABELS[province.region]}</p>
            <h1 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">{province.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> Ibu kota: {province.capital}
              </span>
              <span className="rounded-lg bg-white/15 px-3 py-1">{REGION_ISLAND_LABELS[province.region]}</span>
            </div>
          </div>
          <img
            src={islandImg}
            alt={REGION_ISLAND_LABELS[province.region]}
            className="h-20 w-20 shrink-0 object-contain drop-shadow-lg md:h-28 md:w-28"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <SectionTitle icon={<BookOpen className="h-5 w-5" />} title="Kekayaan Budaya" subtitle={`Kenali budaya khas ${province.name} dari sumber terpercaya.`}
        action={<span className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600">{cultures?.length ?? 0} entri budaya</span>} />

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2" aria-label="Memuat data budaya">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl border border-sky/10 bg-gray-50" />)}
        </div>
      )}

      {offline && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-warm/30 bg-warm/10 p-4">
          <span className="text-lg" aria-hidden>📴</span>
          <p className="text-sm font-semibold text-amber-900/80">
            Mode offline: data budaya diambil dari paket lokal karena server tidak bisa dihubungi.
            {apiError ? ` ${apiError.message}` : ""}
          </p>
        </div>
      )}

      {isError && (
        <EmptyState
          emoji="🛠️"
          title="Gagal memuat data budaya"
          description={apiError ? `${apiError.message} ${apiError.hint ?? ""}` : "Pastikan server budaya sedang berjalan, lalu coba lagi."}
          action={<Button onClick={() => refetch()}>Coba Lagi</Button>}
        />
      )}

      {!isLoading && !isError && cultures?.length === 0 && (
        <EmptyState emoji="🗂️" title="Belum ada data budaya" description="Data untuk provinsi ini belum tersedia. Kamu tetap bisa mencoba kuisnya." />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {cultures?.map((c) => {
          const meta = CATEGORY_META[c.category] ?? fallbackMeta;
          return (
            <Card key={c.id} className="h-full">
              <div className="flex items-start gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                  aria-hidden
                >
                  {meta.icon}
                </span>
                <div className="min-w-0">
                  <span
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: `${meta.color}14`, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <h2 className="mt-1.5 font-display text-lg font-extrabold leading-tight text-ink">{c.name}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{c.description}</p>
                  <p className="mt-2 text-xs text-gray-500">Sumber: {c.source}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 border-secondary/30 bg-secondary/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800">Tantangan Budaya</p>
            <h2 className="font-display text-2xl font-extrabold text-ink">Uji Pemahamanmu</h2>
            <p className="mt-1 text-sm text-gray-700">26 soal tentang budaya {province.name}. Kumpulkan XP dan bintang!</p>
            <p className="mt-2 text-xs font-bold text-gray-500">Pilihan ganda • Ya/Tidak • Isian singkat</p>
          </div>
          <Link to={`/kuis/${id}`}><Button>Mulai Kuis <ArrowRight className="h-5 w-5" aria-hidden /></Button></Link>
        </div>
      </Card>

      <div className="mt-8">
        <Link to={`/pulau/${province.region}`}><Button variant="ghost"><ArrowLeft className="h-4 w-4" aria-hidden /> Kembali ke {REGION_ISLAND_LABELS[province.region]}</Button></Link>
      </div>
    </section>
  );
}
