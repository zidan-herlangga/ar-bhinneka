import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { ErrorBoundary } from "../ErrorBoundary";
import { MusicPlayer } from "../MusicPlayer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopBar />
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
