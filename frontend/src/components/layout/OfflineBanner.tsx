import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="relative z-10 border-b border-sky/20 bg-sky/10 px-4 py-2 text-center text-xs font-semibold text-sky-dark"
    >
      Kamu sedang offline. Peta, budaya, kuis, dan tantangan tetap bisa dimainkan.
    </div>
  );
}
