import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: ReactNode;
  accent?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  icon,
  accent = "#3B82F6",
  action,
}: PageHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
              style={{ backgroundColor: `${accent}14`, color: accent }}
              aria-hidden
            >
              {icon}
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-3xl font-extrabold leading-tight text-ink md:text-4xl">
              {title}
            </h1>
          </div>
        </div>
        {action}
      </div>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
          {subtitle}
        </p>
      )}
    </header>
  );
}
