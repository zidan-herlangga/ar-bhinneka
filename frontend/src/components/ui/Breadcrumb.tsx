import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-gray-500"
    >
      <Link
        to="/"
        aria-label="Beranda"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-sky-dark shadow-sm ring-1 ring-sky/10 transition hover:-translate-y-0.5 hover:bg-sky/10"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
          {item.to ? (
            <Link
              to={item.to}
              className="rounded-full px-2 py-1 transition hover:bg-white hover:text-sky-dark"
            >
              {item.label}
            </Link>
          ) : (
            <span
              aria-current="page"
              className="rounded-full bg-white px-2.5 py-1 text-ink shadow-sm ring-1 ring-sky/10"
            >
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
