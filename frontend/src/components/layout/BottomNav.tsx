import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/cn";
import { playClick } from "../../lib/sound";

const items = [
  {
    to: "/",
    label: "Beranda",
    iconSrc: "/assets/icons/mobile/beranda.webp",
    matches: (p: string) => p === "/",
  },
  {
    to: "/peta",
    label: "Peta",
    iconSrc: "/assets/icons/mobile/peta.webp",
    matches: (p: string) =>
      ["/peta", "/pulau", "/provinsi", "/kuis"].some((x) => p.startsWith(x)),
  },
  {
    to: "/tantangan",
    label: "Tantangan",
    iconSrc: "/assets/icons/mobile/tantangan.webp",
    matches: (p: string) => p.startsWith("/tantangan"),
  },
  {
    to: "/profil",
    label: "Profil",
    iconSrc: "/assets/icons/mobile/profil.webp",
    matches: (p: string) => p.startsWith("/profil"),
  },
  {
    to: "/pengaturan",
    label: "Atur",
    iconSrc: "/assets/icons/mobile/pengaturan.webp",
    matches: (p: string) => p.startsWith("/pengaturan"),
  },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch gap-0.5 rounded-3xl border border-white/70 bg-white/90 p-1.5 shadow-[0_14px_34px_-18px_rgba(53,43,39,0.5)] backdrop-blur-md">
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
                  "group relative flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1 pb-1.5 pt-2 transition-all duration-300 ease-out",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky",
                  active
                    ? "bg-sky/10 shadow-[inset_0_0_0_1px_rgba(36,124,131,0.12)]"
                    : "hover:-translate-y-0.5 hover:bg-sky/5 active:translate-y-0 active:scale-95",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 mx-auto h-[3px] rounded-full bg-sky transition-all duration-300 ease-out",
                    active ? "w-7 opacity-100" : "w-0 opacity-0",
                  )}
                />
                <img
                  src={iconSrc}
                  alt=""
                  aria-hidden
                  width={40}
                  height={40}
                  className={cn(
                    "h-10 w-10 shrink-0 select-none object-contain transition-transform duration-300 ease-out",
                    "group-hover:scale-110 group-hover:-rotate-3",
                    "group-active:scale-95 group-active:rotate-0",
                    active && "nav-pop",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold leading-none transition-colors duration-300",
                    active ? "text-sky-dark" : "text-muted/70 group-hover:text-ink",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
