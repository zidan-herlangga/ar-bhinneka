import { Link } from "react-router-dom";
import { ArrowRight, Map, MapPin } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionTitle } from "../components/ui/SectionTitle";
import {
  REGION_LABELS,
  REGION_ISLAND_LABELS,
  REGION_COLORS,
  provincesByRegion,
  type Region,
} from "../data/provinces";

const REGIONS: Region[] = [
  "Sumatra", "Java", "Kalimantan", "Sulawesi",
  "BaliNusaTenggara", "Maluku", "Papua",
];

// Koordinat mengikuti ilustrasi indonesia.png (1774 x 887).
// Hotspot interaktif dihapus; pemilihan pulau dilakukan lewat kartu di bawah.

export function MapPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Peta Indonesia" }]} />

      <PageHeader
        icon={<Map className="h-6 w-6" />}
        title="Peta Indonesia"
        subtitle="Pilih pulau dulu, lalu pilih provinsi untuk menjelajahi budayanya."
      />

      <Card className="mb-8 overflow-hidden p-0">
        <div className="p-3 md:p-5">
          <img src="/assets/maps/indonesia.png" alt="Peta Indonesia" className="h-auto w-full rounded-xl" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-sky/10 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {REGIONS.map((r) => (
              <span key={r} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: REGION_COLORS[r] }} aria-hidden />
                {REGION_LABELS[r]}
              </span>
            ))}
          </div>
          <p className="text-[10px] font-semibold text-gray-500">Peta dasar: © amCharts (CC BY 4.0)</p>
        </div>
      </Card>

      <SectionTitle
        icon={<MapPin className="h-5 w-5" />}
        title="Pilih Pulau"
        subtitle="Setelah memilih pulau, kamu akan melihat daftar provinsi di pulau tersebut."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600">
            <MapPin className="h-4 w-4 text-sky-dark" aria-hidden />7 wilayah
          </span>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REGIONS.map((r) => {
          const provinces = provincesByRegion(r);
          const preview = provinces.slice(0, 4).map((p) => p.name).join(", ");
          const color = REGION_COLORS[r];
          return (
            <Link key={r} to={`/pulau/${r}`}>
              <Card interactive className="h-full">
                <div className="flex items-start gap-3">
                  <span className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-sky/5" aria-hidden>
                    <img
                      src={`/assets/maps/pulau-${r === "BaliNusaTenggara" ? "bali" : r.toLowerCase()}.png`}
                      alt=""
                      className="h-full w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-extrabold leading-tight text-ink">
                      {REGION_ISLAND_LABELS[r]}
                    </h3>
                    <span className="mt-1 inline-block rounded-lg px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: `${color}18`, color }}>
                      {provinces.length} provinsi
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      {preview}
                      {provinces.length > 4 ? ", …" : ""}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-sky-dark">
                      Lihat provinsi <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
