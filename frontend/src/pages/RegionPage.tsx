import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionTitle } from "../components/ui/SectionTitle";
import {
  REGION_LABELS, REGION_ISLAND_LABELS, REGION_COLORS,
  provincesByRegion, type Region,
} from "../data/provinces";

export function RegionPage() {
  const { region } = useParams<{ region: string }>();
  const r = region as Region;
  const label = REGION_LABELS[r];
  const islandLabel = REGION_ISLAND_LABELS[r];
  const provinces = provincesByRegion(r);
  const [query, setQuery] = useState("");
  const filtered = provinces.filter((p) =>
    query.trim() === "" ||
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.capital.toLowerCase().includes(query.toLowerCase())
  );

  if (!label || !islandLabel) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <EmptyState emoji="🧭" title="Pulau tidak ditemukan" description="Yuk kembali ke peta dan pilih pulau lagi."
          action={<Link to="/peta"><Button>Kembali ke Peta</Button></Link>} />
      </section>
    );
  }

  const color = REGION_COLORS[r];
  const islandKey = r === "BaliNusaTenggara" ? "bali" : r.toLowerCase();
  const islandImg = `/assets/maps/pulau-${islandKey}.png`;

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Peta", to: "/peta" }, { label: islandLabel }]} />

      <div className="relative mb-8 overflow-hidden rounded-2xl p-6 text-white" style={{ backgroundColor: color }}>
        <div aria-hidden className="absolute inset-0 bg-ink/40" />
        <div aria-hidden className="absolute inset-0 motif-light opacity-60" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">Wilayah Nusantara</p>
            <h1 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">{islandLabel}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden />{provinces.length} provinsi
              </span>
              <span className="rounded-lg bg-white/20 px-3 py-1">Kuis di tiap provinsi</span>
            </div>
          </div>
          <img
            src={islandImg}
            alt={islandLabel}
            className="h-20 w-20 shrink-0 object-contain drop-shadow-lg md:h-28 md:w-28"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <SectionTitle icon={<MapPin className="h-5 w-5" />} title="Daftar Provinsi" subtitle="Pilih provinsi untuk melihat budaya dan memulai kuis." />

      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari provinsi atau ibu kota..."
          className="w-full rounded-xl border border-sky/20 bg-white px-4 py-2.5 text-sm font-semibold text-ink outline-none transition focus:border-teal"
          aria-label="Cari provinsi"
        />
        {query && (
          <p className="mt-1 text-xs text-muted">{filtered.length} dari {provinces.length} provinsi</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="Provinsi tidak ditemukan" description="Coba kata kunci lain." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p, i) => (
          <Link key={p.id} to={`/provinsi/${p.id}`}>
            <Card interactive className="h-full">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold" style={{ backgroundColor: `${color}18`, color }} aria-hidden>
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-extrabold leading-tight text-ink">{p.name}</h2>
                  <p className="mt-0.5 text-sm text-gray-600">Ibu kota: {p.capital}</p>
                </div>
                <span className="ml-auto text-sky-dark" aria-hidden><ArrowRight className="h-5 w-5" /></span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      )}

      <div className="mt-8">
        <Link to="/peta"><Button variant="ghost"><ArrowLeft className="h-4 w-4" aria-hidden /> Kembali ke Peta</Button></Link>
      </div>
    </section>
  );
}
