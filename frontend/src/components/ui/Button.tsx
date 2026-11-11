import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import { playClick } from "../../lib/sound";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  dots?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-primary-dark text-white hover:bg-primary shadow-sm",
  secondary: "bg-warm text-amber-950 hover:bg-amber-300 shadow-sm",
  ghost: "bg-white text-sky-dark border border-sky/20 hover:bg-sky/5",
  danger: "bg-flag-red text-white hover:bg-red-700 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-7 py-3.5 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", dots = false, onClick, children, ...props }, ref) => (
    <button
      ref={ref}
      onClick={(event) => {
        playClick();
        onClick?.(event);
      }}
      className={cn(
        "btn-touch inline-flex items-center justify-center gap-2 rounded-xl font-extrabold font-display transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
      {dots && (
        <span className="flex gap-1" aria-hidden>
          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-current" />
          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-current" />
          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
    </button>
  )
);
Button.displayName = "Button";
