import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
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
      {showApiWarning && (
        <div className="relative z-10 border-b border-warm/30 bg-warm/15 px-4 py-2 text-center text-xs font-semibold text-amber-900">
          ⚠️ Mode demo: <code className="font-mono">VITE_API_BASE_URL</code> belum diatur, jadi data
          budaya dari server tidak bisa dimuat.
        </div>
      )}
      <main className="relative z-10 flex-1 pb-24 md:pb-10">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <footer className="hidden pb-6 text-center text-xs text-muted md:block">
        🇮🇩 Dibuat untuk belajar budaya Indonesia
      </footer>
      <MusicPlayer />
      <BottomNav />
    </div>
  );
}
