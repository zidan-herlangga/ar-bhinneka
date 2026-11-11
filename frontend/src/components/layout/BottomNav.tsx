import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/cn";
import { playClick } from "../../lib/sound";

const items = [
  { to: "/", label: "Beranda", iconSrc: "/assets/icons/mobile/beranda.png", matches: (p: string) => p === "/" },
  { to: "/peta", label: "Peta", iconSrc: "/assets/icons/mobile/peta.png", matches: (p: string) => ["/peta", "/pulau", "/provinsi", "/kuis"].some((x) => p.startsWith(x)) },
  { to: "/pengalaman-ar", label: "AR", iconSrc: "/assets/icons/mobile/ar.png", matches: (p: string) => p.startsWith("/pengalaman-ar") },
  { to: "/profil", label: "Profil", iconSrc: "/assets/icons/mobile/profil.png", matches: (p: string) => p.startsWith("/profil") },
  { to: "/pengaturan", label: "Atur", iconSrc: "/assets/icons/mobile/pengaturan.png", matches: (p: string) => p.startsWith("/pengaturan") },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-between gap-1 rounded-2xl border border-sky/10 bg-white p-1.5 shadow-md">
        {items.map(({ to, label, iconSrc, matches }) => {
          const active = matches(pathname);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                onClick={playClick}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center rounded-2xl px-1 py-1.5 transition",
                  active ? "bg-sky/10" : "hover:bg-gray-50"
                )}
              >
                <img
                  src={iconSrc}
                  alt={label}
                  className={cn("h-14 w-auto max-w-none object-contain transition-transform", active && "scale-105")}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
