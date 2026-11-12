import { Link, useLocation } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { playClick } from "../../lib/sound";

const items = [
  {
    to: "/",
    label: "Beranda",
    iconSrc: "/assets/icons/mobile/beranda.png",
    matches: (p: string) => p === "/",
  },
  {
    to: "/peta",
    label: "Peta",
    iconSrc: "/assets/icons/mobile/peta.png",
    matches: (p: string) =>
      ["/peta", "/pulau", "/provinsi", "/kuis"].some((x) => p.startsWith(x)),
  },
  {
    to: "/tantangan",
    label: "Tantangan",
    matches: (p: string) => p.startsWith("/tantangan"),
  },
  {
    to: "/profil",
    label: "Profil",
    iconSrc: "/assets/icons/mobile/profil.png",
    matches: (p: string) => p.startsWith("/profil"),
  },
  {
    to: "/pengaturan",
    label: "Atur",
    iconSrc: "/assets/icons/mobile/pengaturan.png",
    matches: (p: string) => p.startsWith("/pengaturan"),
  },
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
                  active ? "bg-sky/50" : "hover:bg-gray/5 active:bg-gray/10",
                )}
              >
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt=""
                    aria-hidden
                    className={cn(
                      "h-14 w-auto max-w-none object-contain transition-transform",
                      active && "scale-105",
                    )}
                  />
                ) : (
                  <Gamepad2
                    className={cn(
                      "h-9 w-9 text-sky-dark transition-transform",
                      active && "scale-105",
                    )}
                    aria-hidden
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
