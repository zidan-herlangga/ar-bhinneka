import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Transisi halus (fade + slide kecil) setiap pindah halaman.
 * Menggunakan Web Animations API supaya konten tetap terlihat normal
 * walaupun browser tidak menjalankan animasi CSS.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });

    const node = ref.current;
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    if (!node || reduced) return;

    const animation = node.animate(
      [
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 180, easing: "ease-out", fill: "none" }
    );

    // Pengaman: kalau timeline animasi tertahan, pastikan konten tetap terlihat.
    const guard = window.setTimeout(() => animation.cancel(), 320);

    return () => {
      window.clearTimeout(guard);
      animation.cancel();
    };
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
