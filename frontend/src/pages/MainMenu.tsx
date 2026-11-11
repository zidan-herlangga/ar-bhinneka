import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Compass, Glasses, Trophy, User } from "lucide-react";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { SectionTitle } from "../components/ui/SectionTitle";
import { usePlayerStore } from "../store/playerStore";
import { playClick } from "../lib/sound";
// import { Mascot } from "../components/illustrations/Mascot";

const features = [
  {
    to: "/peta",
    icon: Compass,
    title: "Jelajah Peta",
    desc: "Pilih pulau dan provinsi, kenali budayanya.",
  },
  {
    to: "/pengalaman-ar",
    icon: Glasses,
    title: "AR Budaya",
    desc: "Lihat budaya Indonesia dalam Augmented Reality.",
  },
  {
    to: "/pencapaian",
    icon: Trophy,
    title: "Pencapaian",
    desc: "Kumpulkan bintang dan buka lencana budaya.",
  },
  {
    to: "/profil",
    icon: User,
    title: "Profil Saya",
    desc: "Lihat level, XP, dan riwayat kuis.",
  },
];

const steps = [
  { n: "1", title: "Pilih pulau", desc: "Temukan provinsi favoritmu." },
  { n: "2", title: "Baca budaya", desc: "Kenali rumah, tarian, dan makanan." },
  { n: "3", title: "Ikuti kuis", desc: "Kumpulkan XP dan bintang." },
];

export function MainMenu() {
  const { nickname, avatar } = usePlayerStore();

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          backgroundImage: "url('/assets/banners/kenal-budaya.png')",
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
                src="/assets/buttons/start.png"
                alt="Mulai Petualangan"
                className="h-12 w-auto md:h-16"
                loading="eager"
                decoding="async"
              />
            </Link>
            <Link
              to="/pengalaman-ar"
              className="inline-block transition hover:scale-105 active:scale-95"
              onClick={playClick}
            >
              <img
                src="/assets/buttons/ar.png"
                alt="Coba AR"
                className="h-12 w-auto max-w-none shrink-0 md:h-16"
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>
        </div>
        {/* <Mascot className="floaty absolute bottom-4 left-4 h-16 w-16 drop-shadow-lg md:h-20 md:w-20" /> */}
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

      <SectionTitle
        icon={<Compass className="h-5 w-5" />}
        title="Mulai dari sini"
        subtitle="Semua tempat belajar budaya ada di sini."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {features.map((f) => (
          <Link key={f.to} to={f.to}>
            <Card interactive className="h-full">
              <div className="flex items-start gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky/10 text-sky-dark"
                  aria-hidden
                >
                  <f.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-extrabold text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {f.desc}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <Link to="/peta">
          <Button size="lg" dots>
            Mulai dari sini
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        </Link>
      </div>

      <SectionTitle
        icon={<BookOpen className="h-5 w-5" />}
        title="Cara main"
        subtitle="Hanya tiga langkah untuk jadi Pahlawan Budaya."
      />
      <div className="grid divide-y divide-sky/10 rounded-2xl border border-sky/10 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
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
