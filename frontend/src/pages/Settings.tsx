import { useEffect, useState } from "react";
import { Check, Download, Info, Leaf, Music, RotateCcw, Save, ShieldCheck, SlidersHorizontal, Type, UserRound, Volume2, VolumeX, Wifi } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionTitle } from "../components/ui/SectionTitle";
import { usePlayerStore } from "../store/playerStore";
import { cn } from "../lib/cn";
import { isSoundEnabled, setSoundEnabled, playClick } from "../lib/sound";
import { apiFetch, getApiBase, setApiBase } from "../lib/api";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

const ENV_API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

const AVATARS = ["👧", "👦", "🧒", "👩", "🧑", "🦊", "🐼", "🦜"];

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}

function Toggle({ checked, onChange, icon, label, description }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl border border-sky/10 bg-white p-3 text-left transition hover:border-sky/30">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky/10 text-sky-dark" aria-hidden>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{label}</span>
        <span className="block text-xs text-gray-500">{description}</span>
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-green" : "bg-gray-200")} aria-hidden>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}

export function Settings() {
  const { nickname, avatar, setNickname, setAvatar, resetProgress } = usePlayerStore();
  const installPrompt = useInstallPrompt();

  const [draftName, setDraftName] = useState(nickname);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const [checking, setChecking] = useState(false);
  const [connection, setConnection] = useState<{ ok: boolean; message?: string } | null>(null);
  const [apiBaseDraft, setApiBaseDraft] = useState(() => getApiBase());

  const saveApiBase = () => {
    setApiBase(apiBaseDraft);
    setApiBaseDraft(getApiBase());
    setConnection(null);
  };

  const checkConnection = async () => {
    setChecking(true);
    setConnection(null);
    try {
      const data = await apiFetch<{ status?: string }>("/api/health");
      setConnection({ ok: true, message: data?.status });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tidak diketahui";
      setConnection({ ok: false, message });
    } finally {
      setChecking(false);
    }
  };

  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem("bti-reduce-motion") === "1");
  const [largeText, setLargeText] = useState(() => localStorage.getItem("bti-large-text") === "1");
  const [sound, setSound] = useState(() => isSoundEnabled());
  const [music, setMusic] = useState(() => localStorage.getItem("bti-music") !== "0");

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
    localStorage.setItem("bti-reduce-motion", reduceMotion ? "1" : "0");
  }, [reduceMotion]);

  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? "18px" : "";
    localStorage.setItem("bti-large-text", largeText ? "1" : "0");
  }, [largeText]);

  useEffect(() => {
    setSoundEnabled(sound);
  }, [sound]);

  useEffect(() => {
    localStorage.setItem("bti-music", music ? "1" : "0");
  }, [music]);

  const saveProfile = () => { setNickname(draftName.trim() || "Pahlawan Budaya"); setSaved(true); playClick(); };
  const doReset = () => { resetProgress(); setConfirmReset(false); setResetDone(true); };

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 md:py-8">
      <PageHeader icon={<SlidersHorizontal className="h-6 w-6" />} title="Pengaturan" subtitle="Ubah profil dan sesuaikan tampilan agar nyaman untuk belajar." />

      <SectionTitle icon={<UserRound className="h-5 w-5" />} title="Profil Pemain" subtitle="Pilih avatar dan nama pahlawanmu." />
      <Card className="mb-8">
        <label className="text-xs font-bold uppercase tracking-wider text-muted" htmlFor="nickname">Nama panggilan</label>
        <input id="nickname" value={draftName} onChange={(e) => { setDraftName(e.target.value); setSaved(false); }} maxLength={24}
          placeholder="Tulis namamu..." className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-ink outline-none transition focus:border-sky" />

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">Avatar</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVATARS.map((emoji) => (
            <button key={emoji} type="button" aria-label={`Pilih avatar ${emoji}`} aria-pressed={avatar === emoji}
              onClick={() => { setAvatar(emoji); setSaved(false); }}
              className={cn("grid h-11 w-11 place-items-center rounded-xl border text-2xl transition hover:-translate-y-0.5",
                avatar === emoji ? "border-sky bg-sky/10" : "border-transparent bg-gray-50")}>
              <span aria-hidden>{emoji}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={saveProfile}><Save className="h-4 w-4" aria-hidden /> Simpan Profil</Button>
          {saved && <span className="inline-flex items-center gap-1 text-sm font-bold text-green-700"><Check className="h-4 w-4" aria-hidden /> Profil tersimpan!</span>}
        </div>
      </Card>

      <SectionTitle icon={<Leaf className="h-5 w-5" />} title="Preferensi Tampilan" subtitle="Sesuaikan animasi dan ukuran teks." />
      <Card className="mb-8 space-y-3">
        <Toggle checked={music} onChange={setMusic} icon={<Music className="h-4 w-4" />} label="Musik latar" description="Putar lagu 'Dari Sabang Sampai Merauke' di latar." />
        <Toggle checked={sound} onChange={setSound} icon={sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} label="Efek suara" description="Nyalakan bunyi saat menjawab kuis dan menekan tombol." />
        <Toggle checked={reduceMotion} onChange={setReduceMotion} icon={<Leaf className="h-4 w-4" />} label="Kurangi animasi" description="Matikan gerakan agar tampilan lebih tenang." />
        <Toggle checked={largeText} onChange={setLargeText} icon={<Type className="h-4 w-4" />} label="Teks lebih besar" description="Perbesar ukuran teks untuk memudahkan membaca." />
      </Card>

      <SectionTitle icon={<Download className="h-5 w-5" />} title="Pasang Aplikasi" subtitle="Pasang di layar utama agar mudah dibuka kapan saja." />
      <Card className="mb-8">
        {installPrompt.installed ? (
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green/10 text-green-700"><Check className="h-5 w-5" aria-hidden /></span>
            <div>
              <p className="font-display text-lg font-extrabold text-ink">Aplikasi sudah terpasang</p>
              <p className="text-sm text-gray-600">Buka dari ikon di layar utama. Aplikasi dapat dipakai tanpa internet.</p>
            </div>
          </div>
        ) : installPrompt.installable ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => { void installPrompt.install(); playClick(); }}><Download className="h-4 w-4" aria-hidden /> Pasang aplikasi</Button>
            <span className="text-sm text-gray-600">Pasang ke layar utama (tanpa toko aplikasi).</span>
          </div>
        ) : installPrompt.isIOS ? (
          <div className="text-sm text-gray-600">
            <p className="font-bold text-ink">Di iPhone / iPad:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Ketuk tombol <strong>Bagikan</strong> di Safari.</li>
              <li>Pilih <strong>Tambahkan ke Layar Utama</strong>.</li>
              <li>Ketuk <strong>Tambah</strong>.</li>
            </ol>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Gunakan menu browser (⋮) lalu pilih <strong>Install app</strong> atau <strong>Tambahkan ke layar utama</strong>.</p>
        )}
      </Card>

      <SectionTitle icon={<ShieldCheck className="h-5 w-5" />} title="Data & Privasi" subtitle="Kamu memegang kendali atas progresmu." />
      <Card className="mb-8">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green/10 text-green-700"><ShieldCheck className="h-5 w-5" aria-hidden /></span>
          <div>
            <p className="font-display text-lg font-extrabold text-ink">Aman untuk anak</p>
            <p className="text-sm text-gray-600">Progres disimpan di perangkat ini. Kami tidak meminta data pribadi seperti alamat atau nomor telepon.</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-flag-red/20 bg-flag-red/5 p-4">
          <p className="font-display text-lg font-extrabold text-flag-red">Reset progres</p>
          <p className="mt-0.5 text-sm text-gray-600">XP, level, dan bintang akan kembali ke awal. Nama dan avatar tetap tersimpan.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!confirmReset ? (
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}><RotateCcw className="h-4 w-4" aria-hidden /> Reset Progres</Button>
            ) : (
              <>
                <Button variant="danger" size="sm" onClick={doReset}>Ya, reset sekarang</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>Batal</Button>
              </>
            )}
            {resetDone && <span className="text-sm font-bold text-green-700">Progres berhasil direset.</span>}
          </div>
        </div>
      </Card>

      <details className="group mb-8">
        <summary className="mb-3 flex cursor-pointer list-none items-center gap-2 rounded-xl border border-sky/10 bg-white px-4 py-3 text-sm font-bold text-muted transition hover:bg-sky/5 [&::-webkit-details-marker]:hidden">
          <Wifi className="h-4 w-4 text-sky-dark" aria-hidden />
          Pengaturan lanjutan (guru/pengembang)
          <span className="ml-auto text-xs font-semibold text-gray-400 group-open:hidden">Tampilkan</span>
          <span className="ml-auto hidden text-xs font-semibold text-gray-400 group-open:inline">Sembunyikan</span>
        </summary>
        <SectionTitle icon={<Wifi className="h-5 w-5" />} title="Koneksi Server" subtitle="Cek apakah aplikasi bisa menjangkau backend." />
        <Card className="mb-8">
        <label className="text-xs font-bold uppercase tracking-wider text-muted" htmlFor="api-base">
          Alamat backend
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          <input
            id="api-base"
            value={apiBaseDraft}
            onChange={(e) => setApiBaseDraft(e.target.value)}
            placeholder="https://backend-anda.onrender.com"
            className="min-w-0 flex-1 rounded-xl border border-sky/20 bg-white px-4 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-teal"
          />
          <Button variant="ghost" size="sm" onClick={saveApiBase}>
            <Save className="h-4 w-4" aria-hidden /> Simpan
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Dikunci dari <code className="font-mono">VITE_API_BASE_URL</code>:{" "}
          <code className="font-mono">{ENV_API_BASE || "(belum diisi)"}</code>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={checkConnection} disabled={checking}>
            {checking ? "Memeriksa..." : "Cek Koneksi"}
          </Button>
          {connection && (
            <span className={cn("text-sm font-bold", connection.ok ? "text-green-700" : "text-flag-red")}>
              {connection.ok ? "✅ Server bisa dihubungi" : `❌ ${connection.message}`}
            </span>
          )}
        </div>
      </Card>
      </details>

      <SectionTitle icon={<Info className="h-5 w-5" />} title="Tentang Aplikasi" />
      <Card>
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warm/20 text-amber-700"><Info className="h-5 w-5" aria-hidden /></span>
          <div className="min-w-0">
            <p className="font-display text-lg font-extrabold text-ink">Bhinneka Tunggal Ika <span className="text-sm font-bold text-gray-500">v1.0.0</span></p>
            <p className="mt-1 text-sm text-gray-600">Petualangan budaya Indonesia untuk siswa SD. Jelajahi 38 provinsi, baca budaya, lalu uji pemahaman lewat kuis dan tantangan.</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
