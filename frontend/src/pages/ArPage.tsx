import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Camera, CheckCircle2, Info, ScanLine, Smartphone, XCircle } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionTitle } from "../components/ui/SectionTitle";
import { Suspense, lazy } from "react";
import { useArSupport } from "../hooks/useArSupport";
import { cn } from "../lib/cn";
import { apiUrl } from "../lib/api";
import { PROVINCES } from "../data/provinces";

const ThreeViewer = lazy(() => import("../components/ar/ThreeViewer").then((m) => ({ default: m.ThreeViewer })));

type Mode = "marker" | "markerless";

interface Culture { id: string; category: string; name: string; description: string; }

const CATEGORY_EMOJI: Record<string, string> = {
  house: "🏠", clothing: "👘", dance: "💃", instrument: "🎵", food: "🍜", art: "🎨",
};

export function ArPage() {
  const support = useArSupport();
  const [mode, setMode] = useState<Mode>("marker");
  const [arStarted, setArStarted] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("bali");

  const { data: cultures } = useQuery<Culture[]>({
    queryKey: ["cultures", selectedProvince],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/cultures?province_id=${selectedProvince}`));
      if (!res.ok) return [];
      return res.json();
    },
  });


  const statusItems = [
    { label: "Kamera", icon: <Camera className="h-4 w-4" />, ok: support.camera, okText: "Didukung", noText: "Tidak didukung" },
    { label: "WebXR (immersive-ar)", icon: <Smartphone className="h-4 w-4" />, ok: support.webxr, okText: "Didukung", noText: "Tidak didukung" },
    { label: "MindAR (marker)", icon: <ScanLine className="h-4 w-4" />, ok: support.mindar, okText: "Siap", noText: "Tidak siap" },
  ];

  const steps = [
    { n: "1", title: "Pilih provinsi", desc: "Tentukan budaya yang ingin dijelajahi." },
    { n: "2", title: "Siapkan marker", desc: "Cetak atau tampilkan gambar budaya di layar lain." },
    { n: "3", title: "Arahkan kamera", desc: "Kamera akan melacak marker dan menampilkan 3D." },
    { n: "4", title: "Jelajahi", desc: "Putar dan zoom objek 3D budaya." },
  ];

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 md:py-8">
      <PageHeader icon={<ScanLine className="h-6 w-6" />} title="Pengalaman AR" subtitle="Jelajahi budaya Indonesia dalam Augmented Reality, atau gunakan penampil 3D jika perangkat belum mendukung." />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-warm/30 bg-warm/10 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warm/20 text-amber-700"><Info className="h-5 w-5" aria-hidden /></span>
        <p className="text-sm font-semibold text-amber-900/80">
          Fitur AR masih dalam tahap pengembangan dan perlu diuji pada perangkat nyata sebelum dipakai di kelas. Saat ini yang tersedia adalah pratinjau dan fallback 3D.
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-xl border border-sky/10 bg-white p-1">
        <button type="button" onClick={() => { setMode("marker"); setArStarted(false); }} aria-pressed={mode === "marker"}
          className={cn("inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition", mode === "marker" ? "bg-primary-dark text-white" : "text-gray-500 hover:text-teal-dark")}>
          <ScanLine className="h-4 w-4" aria-hidden /> Marker-based
        </button>
        <button type="button" onClick={() => { setMode("markerless"); setArStarted(false); }} aria-pressed={mode === "markerless"}
          className={cn("inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition", mode === "markerless" ? "bg-primary-dark text-white" : "text-gray-500 hover:text-teal-dark")}>
          <Smartphone className="h-4 w-4" aria-hidden /> Markerless
        </button>
      </div>

      <Card className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-extrabold text-ink">Status Kompatibilitas</h2>
          <span className="inline-flex items-center gap-1 rounded-lg bg-teal/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-dark"><Camera className="h-3 w-3" aria-hidden /> Deteksi perangkat</span>
        </div>
        {support.loading ? (
          <div className="grid gap-2 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-3">
            {statusItems.map((item) => (
              <li key={item.label} className={cn("rounded-xl p-3 border", item.ok ? "border-green/20 bg-green/5" : "border-gray-200 bg-gray-50")}>
                <p className="text-xs font-bold text-gray-500">{item.icon} {item.label}</p>
                <p className={cn("mt-1 inline-flex items-center gap-1 text-sm font-bold", item.ok ? "text-green-700" : "text-gray-400")}>
                  {item.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
                  {item.ok ? item.okText : item.noText}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {mode === "marker" && (
        <Card className="mb-6">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal-dark" aria-hidden><ScanLine className="h-6 w-6" /></span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-extrabold text-ink">AR Berbasis Marker</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">Arahkan kamera ke marker gambar budaya. MindAR akan melacak marker dan menampilkan model 3D. {!support.camera && " Kamera tidak tersedia pada perangkat ini."}</p>
              <div className="mt-3">
                <Button disabled={!support.camera || arStarted} onClick={() => setArStarted(true)}>
                  <ScanLine className="h-4 w-4" aria-hidden /> {arStarted ? "AR Berjalan..." : "Mulai AR Marker"}
                </Button>
              </div>
            </div>
          </div>
          {arStarted && (
            <div className="mt-4 rounded-xl border border-dashed border-teal/30 bg-teal/5 p-5 text-center">
              <div className="text-3xl" aria-hidden>📷</div>
              <p className="mt-2 text-sm font-bold text-gray-600">Area kamera (placeholder)</p>
              <p className="mt-1 text-xs text-gray-500">Integrasi MindAR penuh memerlukan marker image dan model GLB, serta pengujian pada perangkat nyata.</p>
            </div>
          )}
        </Card>
      )}

      {mode === "markerless" && (
        <Card className="mb-6">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gray-100 text-gray-600" aria-hidden><Smartphone className="h-6 w-6" /></span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-extrabold text-ink">AR Tanpa Marker (WebXR)</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">Tempatkan objek 3D pada permukaan nyata menggunakan WebXR. {!support.webxr && " Perangkat/browser ini tidak mendukung WebXR immersive-ar."}</p>
              <div className="mt-3">
                <Button variant="secondary" disabled={!support.webxr} onClick={() => setArStarted(true)}>
                  <Box className="h-4 w-4" aria-hidden /> {support.webxr ? "Mulai AR Markerless" : "Tidak Didukung"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <SectionTitle icon={<Box className="h-5 w-5" />} title="Cara Menggunakan AR" subtitle="Ikuti langkah berikut untuk mencoba AR budaya." />
      <div className="mb-6 grid divide-y divide-sky/10 rounded-2xl border border-sky/10 bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.n} className="p-4">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-dark text-xs font-extrabold text-white" aria-hidden>{step.n}</span>
            <h3 className="mt-2 font-display text-sm font-extrabold text-ink">{step.title}</h3>
            <p className="mt-1 text-xs text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>

      <SectionTitle icon={<ScanLine className="h-5 w-5" />} title="Kandidat Marker Budaya" subtitle={`Pilih provinsi untuk melihat budaya yang bisa dijadikan marker.`} />
      <Card className="mb-6">
        <div className="mb-3">
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full rounded-xl border border-sky/20 bg-white px-4 py-2.5 text-sm font-semibold text-ink outline-none transition focus:border-teal"
            aria-label="Pilih provinsi"
          >
            {PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {cultures && cultures.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {cultures.map((c) => (
              <li key={c.id} className="flex items-start gap-3 rounded-xl border border-sky/10 bg-gray-50 p-3">
                <span className="text-2xl" aria-hidden>{CATEGORY_EMOJI[c.category] ?? "✨"}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">{c.category}</p>
                  <p className="font-display text-sm font-extrabold text-ink">{c.name}</p>
                  <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{c.description}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Memuat budaya...</p>
        )}
      </Card>

      <SectionTitle icon={<Box className="h-5 w-5" />} title="Fallback: Penampil 3D" subtitle="Jika AR tidak didukung, gunakan penampil 3D interaktif (putar & zoom)." />
      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-teal/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-dark"><Box className="h-3 w-3" aria-hidden /> Mode 3D</span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700"><CheckCircle2 className="h-3 w-3" aria-hidden /> Selalu tersedia</span>
        </div>
        <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-gray-100" />}>
          <ThreeViewer />
        </Suspense>
        <p className="mt-3 text-xs text-gray-500">Gunakan jari atau mouse untuk memutar objek. Model 3D budaya akan ditambahkan pada tahap berikutnya.</p>
      </Card>
    </section>
  );
}
