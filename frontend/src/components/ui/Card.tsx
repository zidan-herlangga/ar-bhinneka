import { cn } from "../../lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-sky/10 bg-white p-5 shadow-card",
        interactive &&
          "cursor-pointer transition hover:-translate-y-0.5 hover:border-sky/30 hover:shadow-md active:scale-[0.99]",
        className
      )}
      {...props}
    />
  );
}
