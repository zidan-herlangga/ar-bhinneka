import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { OfflineBanner } from "./OfflineBanner";
import { ErrorBoundary } from "../ErrorBoundary";
import { MusicPlayer } from "../MusicPlayer";
import { apiConfigured } from "../../lib/api";

export function AppShell({ children }: { children: React.ReactNode }) {
  // Di localhost memakai proxy Vite, jadi banner hanya ditampilkan di build produksi.
  const isProd = import.meta.env.PROD;
  const showApiWarning = isProd && !apiConfigured();

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopBar />
      <OfflineBanner />
      {showApiWarning && (
        <div className="relative z-10 border-b border-warm/30 bg-warm/15 px-4 py-2 text-center text-xs font-semibold text-amber-900">
          ⚠️ Mode demo: <code className="font-mono">VITE_API_BASE_URL</code> belum diatur, jadi data
          budaya dari server tidak bisa dimuat.
        </div>
      )}
      <main className="relative z-10 flex-1 pb-6 md:pb-10">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <footer className="relative z-10 pb-28 pt-6 text-center md:pb-6">
        <div aria-hidden className="motif-band mx-auto mb-4 w-40 rounded-full" />
        <p className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-4 text-xs text-muted">
          <span className="inline-flex items-center gap-2">
            <span
              className="block h-3 w-[18px] overflow-hidden rounded-[3px] ring-1 ring-inset ring-ink/15"
              aria-hidden
            >
              <span className="block h-1/2 w-full bg-flag-red" />
              <span className="block h-1/2 w-full bg-white" />
            </span>
            <span className="font-display text-sm font-extrabold tracking-wide text-ink">
              By: Nabila
            </span>
          </span>
          <span aria-hidden className="text-sky/40">
            •
          </span>
          <span>Dibuat untuk belajar budaya Indonesia</span>
        </p>
      </footer>
      <MusicPlayer />
      <BottomNav />
    </div>
  );
}
