import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Download,
  Gamepad2,
  X,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SectionTitle } from "../components/ui/SectionTitle";
import { usePlayerStore } from "../store/playerStore";
import { playClick } from "../lib/sound";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

const features = [
  {
    to: "/peta",
    iconSrc: "/assets/icons/mobile/peta.webp",
    color: "#247C83",
    title: "Jelajah Peta",
    desc: "Pilih pulau dan provinsi, kenali budayanya.",
  },
  {
    to: "/tantangan",
    iconSrc: "/assets/icons/mobile/tantangan.webp",
    color: "#F28C28",
    title: "Tantangan Budaya",
    desc: "Main tiga mini-game: jodohkan budaya, kartu ingatan, dan tebak petunjuk.",
  },
  {
    to: "/pencapaian",
    iconSrc: "/assets/icons/pencapaian.webp",
    color: "#F2C14E",
    title: "Pencapaian",
    desc: "Kumpulkan bintang dan buka lencana budaya.",
  },
  {
    to: "/profil",
    iconSrc: "/assets/icons/mobile/profil.webp",
    color: "#78A9B5",
    title: "Profil Saya",
    desc: "Lihat level, XP, dan riwayat kuis.",
  },
];

const steps = [
  { n: "1", title: "Pilih pulau", desc: "Temukan provinsi favoritmu." },
  { n: "2", title: "Baca budaya", desc: "Kenali rumah, tarian, dan makanan." },
  { n: "3", title: "Uji pemahaman", desc: "Ikuti kuis dan tantangan budaya." },
];

export function MainMenu() {
  const { nickname, avatar } = usePlayerStore();
  const install = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("bti-install-dismissed") === "1");
  const showBanner = !install.installed && !dismissed;

  const dismissBanner = () => {
    localStorage.setItem("bti-install-dismissed", "1");
    setDismissed(true);
  };
  const doInstall = async () => {
    const ok = await install.install();
    playClick();
    if (!ok && !install.installed) {
      // native prompt tidak tersedia; biarkan instruksi inline tampil
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          backgroundImage: "url('/assets/banners/kenal-budaya.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div aria-hidden className="absolute inset-0 bg-ink/45" />
        <div className="relative flex min-h-[400px] flex-col items-center justify-end gap-3 px-6 pb-8 pt-32 text-center text-white md:min-h-[520px] md:pb-10 md:pt-40">
          <div className="flex flex-col items-center gap-3">
            <Link
              to="/peta"
              className="inline-block transition hover:scale-105 active:scale-95"
              onClick={playClick}
            >
              <img
                src="/assets/buttons/start.webp"
                alt="Mulai Petualangan"
                className="h-12 w-auto md:h-16"
                loading="eager"
                decoding="async"
              />
            </Link>
            <Link
              to="/tantangan"
              className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-5 font-display text-base font-extrabold text-white backdrop-blur transition hover:bg-white/20 active:scale-95 md:h-16 md:px-7 md:text-lg"
              onClick={playClick}
            >
              <Gamepad2 className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
              Tantangan Budaya
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-sky/10 pb-5">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-full bg-sky/10 text-xl"
            aria-hidden
          >
            {avatar}
          </span>
          <div>
            <p className="text-sm text-gray-500">Halo,</p>
            <p className="font-display text-lg font-extrabold text-ink">
              {nickname}
            </p>
          </div>
        </div>
        <Link to="/profil" className="text-sm font-bold text-sky-dark">
          Lihat profil →
        </Link>
      </div>

      {showBanner && (
        <Card className="mb-6 border-sky/20 bg-sky/5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky/10 text-sky-dark" aria-hidden>
              <Download className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-extrabold text-ink">Pasang aplikasi di layar utama</p>
              <p className="text-xs text-gray-600">Buka lebih cepat dan bisa dipakai tanpa internet.</p>
            </div>
            {install.installable ? (
              <Button size="sm" onClick={doInstall}>
                <Download className="h-4 w-4" aria-hidden /> Pasang
              </Button>
            ) : (
              <button
                type="button"
                onClick={dismissBanner}
                className="text-xs font-bold text-sky-dark underline"
              >
                Tutup
              </button>
            )}
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Tutup"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-sky/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {!install.installable && (
            <div className="mt-3 rounded-xl bg-white/70 p-3 text-xs text-gray-600">
              <p className="font-bold text-ink">Cara pasang manual:</p>
              {install.isIOS ? (
                <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                  <li>Ketuk <strong>Bagikan</strong> (ikon kotak panah) di Safari.</li>
                  <li>Pilih <strong>Tambahkan ke Layar Utama</strong> → <strong>Tambah</strong>.</li>
                </ol>
              ) : (
                <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                  <li>Buka menu browser (ikon <strong>⋮</strong> atau <strong>⋯</strong>).</li>
                  <li>Pilih <strong>Install app</strong> atau <strong>Tambahkan ke layar utama</strong>.</li>
                </ol>
              )}
            </div>
          )}
        </Card>
      )}

      <SectionTitle
        icon={<Gamepad2 className="h-5 w-5" />}
        title="Mulai dari sini"
        subtitle="Semua tempat belajar budaya ada di sini."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="group block h-full">
            <Card interactive className="h-full overflow-hidden">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-primary-dark transition-transform duration-300 group-hover:scale-x-100"
              />
              <div className="flex items-start gap-3">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                  style={{ backgroundColor: `${f.color}18` }}
                  aria-hidden
                >
                  <img
                    src={f.iconSrc}
                    alt=""
                    className="h-7 w-7 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-extrabold text-ink transition-colors duration-300 group-hover:text-sky-dark">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {f.desc}
                  </p>
                </div>
                <span
                  className="mt-1 shrink-0 text-sky-dark opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:-translate-x-2"
                  aria-hidden
                >
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <SectionTitle
        icon={<BookOpen className="h-5 w-5" />}
        title="Cara main"
        subtitle="Hanya tiga langkah untuk jadi Pahlawan Budaya."
      />
      <div className="grid divide-y divide-sky/10 rounded-2xl border mt-5 border-sky/10 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {steps.map((step) => (
          <div key={step.n} className="p-5">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg bg-primary-dark text-sm font-extrabold text-white"
              aria-hidden
            >
              {step.n}
            </span>
            <h3 className="mt-3 font-display text-lg font-extrabold text-ink">
              {step.title}
            </h3>
            <p className="mt-1 text-sm text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
