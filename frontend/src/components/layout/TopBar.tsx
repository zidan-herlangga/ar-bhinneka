import { Link } from "react-router-dom";
import { Star, Trophy, User, Zap } from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import { playClick } from "../../lib/sound";

export function TopBar() {
  const { level, stars } = usePlayerStore();

  return (
    <header className="sticky top-0 z-40 border-b border-sky/10 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <img
            src="/assets/brand/logo.png"
            alt="Logo Bhinneka Tunggal Ika"
            className="h-9 w-auto shrink-0"
            loading="eager"
            decoding="async"
          />
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-sky/10 px-2.5 py-1.5 text-xs font-bold text-sky-dark">
            <Zap className="h-3.5 w-3.5" aria-hidden />L{level}
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-warm/20 px-2.5 py-1.5 text-xs font-bold text-amber-900">
            <Star
              className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
              aria-hidden
            />
            {stars}
          </div>
          <Link
            to="/pencapaian"
            onClick={playClick}
            aria-label="Pencapaian"
            className="grid h-9 w-9 place-items-center rounded-lg text-warm transition hover:bg-warm/10"
          >
            <Trophy className="h-5 w-5" />
          </Link>
          <Link
            to="/profil"
            onClick={playClick}
            aria-label="Profil"
            className="grid h-9 w-9 place-items-center rounded-lg text-sky-dark transition hover:bg-sky/10"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
