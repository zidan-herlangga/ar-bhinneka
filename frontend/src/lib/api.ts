const STORAGE_KEY = "bti-api-base";

function readEnvBase() {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
}

/**
 * Alamat backend. Urutan prioritas:
 * 1. Override dari Pengaturan (localStorage) — berguna untuk app yang sudah online
 *    dan tidak bisa di-build ulang.
 * 2. Environment variable VITE_API_BASE_URL (dikunci saat build).
 * 3. Kosong -> pakai path relatif /api (mode lokal / proxy).
 */
export function getApiBase() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY)?.trim();
    if (saved) return saved.replace(/\/$/, "");
  }
  return readEnvBase();
}

export function setApiBase(value: string) {
  if (typeof window === "undefined") return;
  const trimmed = value.trim().replace(/\/$/, "");
  if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
  else localStorage.removeItem(STORAGE_KEY);
}

export function apiUrl(path: string) {
  const base = getApiBase();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** True kalau backend sudah ditunjuk (lewat env atau pengaturan). */
export function apiConfigured() {
  return getApiBase().length > 0;
}

export class ApiError extends Error {
  hint?: string;
  status?: number;

  constructor(message: string, hint?: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.hint = hint;
    this.status = status;
  }
}

/**
 * Fetch ke API dengan pesan error yang bisa dipahami pengguna.
 * Menangani: backend tidak terjangkau, CORS, dan balasan non-JSON
 * (mis. halaman SPA yang ter-return karena routing Vercel).
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = apiUrl(path);

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError(
      `Tidak bisa menghubungi server API (${url}).`,
      "Periksa koneksi internet, lalu pastikan alamat backend benar dan domain ini diizinkan di CORS_ORIGINS backend."
    );
  }

  const text = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ApiError(
      `Server tidak mengembalikan JSON (${url}).`,
      "Biasanya karena alamat backend belum diatur, atau domain ini belum diizinkan di CORS_ORIGINS backend.",
      response.status
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `Server merespons dengan status ${response.status}.`,
      "Cek log backend dan pengaturan CORS_ORIGINS.",
      response.status
    );
  }

  return data as T;
}
