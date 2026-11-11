import type { ReactNode } from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function SectionTitle({
  title,
  subtitle,
  icon,
  action,
}: SectionTitleProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2 mt-4">
      <div>
        <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink md:text-2xl">
          {icon && (
            <span className="text-sky-dark" aria-hidden>
              {icon}
            </span>
          )}
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
