import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, VolumeX } from "lucide-react";

const STORAGE_KEY = "bti-music";

function readEnabled() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) !== "0";
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(readEnabled);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = 0.32;
    if (enabled) {
      const promise = audio.play();
      if (promise) {
        promise.then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    } else {
      audio.pause();
    }
  }, [enabled]);

  // Browsers block autoplay; start on first user interaction when enabled.
  useEffect(() => {
    if (!enabled) return;
    const start = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) {
        audio.play().then(() => setPlaying(true)).catch(() => {});
      }
    };
    window.addEventListener("pointerdown", start, { once: true });
    return () => window.removeEventListener("pointerdown", start);
  }, [enabled]);

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!enabled) {
      setEnabled(true);
      localStorage.setItem(STORAGE_KEY, "1");
      if (audio) {
        audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
      return;
    }
    if (playing) {
      audio?.pause();
      setPlaying(false);
    } else {
      audio?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const disable = () => {
    setEnabled(false);
    localStorage.setItem(STORAGE_KEY, "0");
    audioRef.current?.pause();
    setPlaying(false);
  };

  return (
    <>
      <audio ref={audioRef} src="/assets/audio/dari-sabang-sampai-merauke.mp3" preload="none" />
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2 md:bottom-6">
        <button
          type="button"
          onClick={handleToggle}
          aria-label={enabled ? (playing ? "Jeda musik" : "Putar musik") : "Nyalakan musik latar"}
          className="grid h-12 w-12 place-items-center rounded-full bg-primary-dark text-white shadow-lg transition hover:scale-105 active:scale-95"
        >
          {!enabled ? <VolumeX className="h-5 w-5" /> : playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        {enabled && (
          <button
            type="button"
            onClick={disable}
            aria-label="Matikan musik latar"
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-muted shadow-md ring-1 ring-sky/10 transition hover:text-teal-dark"
          >
            <Music className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  );
}
