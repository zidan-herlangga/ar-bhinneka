/**
 * Mendaftarkan service worker agar aplikasi bisa dibuka tanpa internet
 * setelah kunjungan pertama. Hanya aktif di build produksi.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // Jangan reload saat instalasi pertama; hanya saat ada versi baru.
    if (!hadController || refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline mode tidak tersedia (mis. browser lama); aplikasi tetap jalan.
    });
  });
}
