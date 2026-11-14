import { useEffect, useState } from "react";

const OFFLINE_READY_KEY = "bti-offline-ready-shown";

export function useOfflineReady() {
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(() => localStorage.getItem(OFFLINE_READY_KEY) === "1");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;
    let cancelled = false;

    const check = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (!reg.active) return false;
        const keys = await caches.keys();
        let count = 0;
        for (const k of keys) count += (await (await caches.open(k)).keys()).length;
        return count >= 60;
      } catch {
        return false;
      }
    };

    const poll = async () => {
      for (let i = 0; i < 120; i++) {
        if (cancelled) return;
        if (await check()) {
          if (!cancelled) setReady(true);
          return;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    };
    void poll();

    return () => {
      cancelled = true;
    };
  }, []);

  const markShown = () => {
    localStorage.setItem(OFFLINE_READY_KEY, "1");
    setShown(true);
  };

  return { ready, shown, markShown };
}