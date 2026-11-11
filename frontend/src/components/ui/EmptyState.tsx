import type { ReactNode } from "react";

interface EmptyStateProps {
  emoji: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-sky/25 bg-white/70 p-8 text-center">
      <div className="floaty text-5xl" aria-hidden>
        {emoji}
      </div>
      <h3 className="mt-3 font-display text-xl font-extrabold text-ink">{title}</h3>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-gray-600">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
