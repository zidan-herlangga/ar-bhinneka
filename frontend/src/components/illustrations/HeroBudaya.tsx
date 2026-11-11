import { cn } from "../../lib/cn";

interface HeroBudayaProps {
  src?: string;
  className?: string;
  alt?: string;
}

export function HeroBudaya({
  src = "/assets/illustrations/hero-awal.svg",
  className = "w-full max-w-lg",
  alt = "Ilustrasi budaya Indonesia",
}: HeroBudayaProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <img
        src={src}
        alt={alt}
        className="w-full max-w-[500px] h-auto block"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}