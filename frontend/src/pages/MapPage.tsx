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

// Polygon disesuaikan dengan bentuk pulau pada gambar peta (1774 x 887).
const HOTSPOTS: Record<Region, { points: string; cx: number; cy: number }> = {
  Sumatra: { points: "30,180 90,150 200,160 280,200 340,270 370,360 380,450 350,540 280,600 200,610 120,570 60,490 25,390 20,280", cx: 210, cy: 390 },
  Java: { points: "400,560 490,545 570,550 650,560 730,575 790,590 830,610 790,640 700,650 600,645 500,640 420,620", cx: 615, cy: 595 },
  Kalimantan: { points: "520,150 620,140 720,160 790,220 820,310 800,410 740,470 660,490 580,470 520,410 500,310", cx: 660, cy: 320 },
  Sulawesi: { points: "900,260 970,250 1010,290 1030,360 1000,430 950,470 900,450 880,390 870,320", cx: 940, cy: 360 },
  BaliNusaTenggara: { points: "820,600 900,595 980,600 1060,610 1140,620 1220,630 1290,640 1270,670 1190,660 1110,650 1030,640 950,630 870,620", cx: 1050, cy: 630 },
  Maluku: { points: "1240,210 1300,200 1340,240 1360,310 1340,390 1300,450 1260,430 1240,350", cx: 1300, cy: 330 },
  Papua: { points: "1360,300 1470,280 1590,300 1690,340 1750,420 1760,520 1730,620 1650,680 1550,700 1450,680 1390,620 1370,520 1370,420", cx: 1560, cy: 500 },
};

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
        <div className="motif relative p-3 md:p-5">
          <img src="/assets/maps/indonesia.png" alt="Peta Indonesia" className="h-auto w-full" />
          <svg viewBox="0 0 1774 887" className="absolute inset-0 h-full w-full" role="img" aria-label="Peta Indonesia interaktif">
            {REGIONS.map((r) => {
              const h = HOTSPOTS[r];
              return (
                <Link key={r} to={`/pulau/${r}`} aria-label={`Pilih ${REGION_ISLAND_LABELS[r]}`}>
                  <polygon points={h.points} fill={REGION_COLORS[r]} fillOpacity="0.5" stroke="white" strokeWidth="3" className="cursor-pointer transition hover:brightness-110" />
                  <text x={h.cx} y={h.cy} textAnchor="middle" dominantBaseline="middle" fill="white" fontWeight="800" fontSize="26" stroke="rgba(0,0,0,0.55)" strokeWidth="4" paintOrder="stroke" className="pointer-events-none">
                    {REGION_LABELS[r]}
                  </text>
                </Link>
              );
            })}
          </svg>
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
