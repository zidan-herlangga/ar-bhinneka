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
  "Sumatra",
  "Java",
  "Kalimantan",
  "Sulawesi",
  "BaliNusaTenggara",
  "Maluku",
  "Papua",
];

// Polygon hotspot transparan (klik tetap aktif, tidak terlihat).
const HOTSPOTS: Record<Region, string> = {
  Sumatra:
    "25,155 75,155 130,190 175,240 230,300 285,355 330,420 385,475 420,520 390,555 340,565 280,535 220,490 170,430 115,365 70,300 35,230",
  Java: "385,500 430,475 510,480 580,505 650,525 735,545 790,575 785,620 740,645 650,635 560,620 480,605 405,585 380,555",
  Kalimantan:
    "490,270 520,215 600,165 680,145 755,145 820,165 885,205 910,260 875,325 850,390 800,455 730,475 650,465 575,450 520,420 490,365 475,310",
  Sulawesi:
    "970,250 1010,230 1050,250 1110,230 1150,240 1140,280 1100,310 1060,315 1040,350 1080,370 1120,350 1150,370 1140,410 1100,440 1070,470 1040,530 1000,545 960,520 950,480 970,430 950,390 920,365 900,330 920,295 950,280",
  BaliNusaTenggara:
    "825,575 890,565 950,570 1010,580 1070,570 1130,580 1190,565 1250,580 1290,600 1260,635 1200,665 1140,690 1080,715 1020,695 960,675 900,655 850,630 810,610",
  Maluku:
    "1205,215 1260,210 1280,250 1265,300 1300,320 1340,300 1380,315 1410,350 1380,385 1330,390 1290,370 1240,390 1190,360 1160,320 1140,270",
  Papua:
    "1400,335 1450,315 1510,325 1570,340 1630,370 1690,405 1715,455 1710,530 1715,625 1670,660 1600,650 1530,640 1460,610 1420,560 1400,490 1390,420",
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
        <div className="relative p-3 md:p-5">
          <img
            src="/assets/maps/indonesia.webp"
            alt="Peta Indonesia"
            className="h-auto w-full"
          />
          <svg
            viewBox="0 0 1774 887"
            className="absolute inset-0 h-full w-full"
            role="group"
            aria-label="Pilih wilayah Indonesia"
          >
            {REGIONS.map((r) => (
              <Link
                key={r}
                to={`/pulau/${r}`}
                aria-label={`Pilih ${REGION_ISLAND_LABELS[r]}`}
              >
                <polygon
                  points={HOTSPOTS[r]}
                  fill="transparent"
                  stroke="transparent"
                  className="cursor-pointer"
                />
              </Link>
            ))}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-sky/10 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {REGIONS.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-600"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: REGION_COLORS[r] }}
                  aria-hidden
                />
                {REGION_LABELS[r]}
              </span>
            ))}
          </div>
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
          const preview = provinces
            .slice(0, 4)
            .map((p) => p.name)
            .join(", ");
          const color = REGION_COLORS[r];
          return (
            <Link key={r} to={`/pulau/${r}`}>
              <Card interactive className="h-full">
                <div className="flex items-start gap-3">
                  <span
                    className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl"
                    style={{ backgroundColor: `${color}18` }}
                    aria-hidden
                  >
                    <img
                      src="/assets/icons/pin.webp"
                      alt=""
                      className="h-14 w-14 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-extrabold leading-tight text-ink">
                      {REGION_ISLAND_LABELS[r]}
                    </h3>
                    <span
                      className="mt-1 inline-block rounded-lg px-2 py-0.5 text-xs font-bold"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      {provinces.length} provinsi
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      {preview}
                      {provinces.length > 4 ? ", …" : ""}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-sky-dark">
                      Lihat provinsi{" "}
                      <ArrowRight className="h-4 w-4" aria-hidden />
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
