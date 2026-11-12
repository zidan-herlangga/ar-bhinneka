import { CULTURES, type Culture } from "../data/localData";
import { PROVINCES, type Province } from "../data/provinces";

export const CATEGORY_LABELS: Record<string, string> = {
  house: "Rumah Adat",
  clothing: "Pakaian Adat",
  dance: "Tarian",
  art: "Seni & Kerajinan",
  instrument: "Alat Musik",
  food: "Makanan Khas",
};

export type GameId = "jodohkan" | "ingatan" | "petunjuk";

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function takeRandom<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, Math.max(0, count));
}

const provinceById = new Map(PROVINCES.map((p) => [p.id, p]));

const culturesWithProvince = CULTURES.filter((c) => provinceById.has(c.province_id));

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/* ------------------------------------------------------------------ */
/* 1. Jodohkan Budaya: nama budaya -> provinsi asal                    */
/* ------------------------------------------------------------------ */

export interface JodohkanRound {
  culture: Culture;
  province: Province;
  options: Province[];
}

export function buildJodohkanRounds(count = 8): JodohkanRound[] {
  return takeRandom(PROVINCES, count).map((province) => {
    const pool = CULTURES.filter((c) => c.province_id === province.id);
    const culture = randomItem(pool);

    // Distraktor diutamakan dari pulau yang sama supaya lebih menantang.
    const sameIsland = PROVINCES.filter(
      (p) => p.region === province.region && p.id !== province.id
    );
    const distractorPool =
      sameIsland.length >= 3 ? sameIsland : PROVINCES.filter((p) => p.id !== province.id);

    return {
      culture,
      province,
      options: shuffle([province, ...takeRandom(distractorPool, 3)]),
    };
  });
}

/* ------------------------------------------------------------------ */
/* 2. Tebak dari Petunjuk: deskripsi -> nama budaya                    */
/* ------------------------------------------------------------------ */

export interface PetunjukRound {
  culture: Culture;
  province: Province;
  options: string[];
}

export function buildPetunjukRounds(count = 8): PetunjukRound[] {
  return takeRandom(culturesWithProvince, count).map((culture) => {
    const province = provinceById.get(culture.province_id)!;

    const sameCategory = CULTURES.filter(
      (c) => c.category === culture.category && c.id !== culture.id
    );
    let names = Array.from(new Set(sameCategory.map((c) => c.name))).filter(
      (n) => n !== culture.name
    );
    if (names.length < 3) {
      names = Array.from(new Set(CULTURES.map((c) => c.name))).filter((n) => n !== culture.name);
    }

    return {
      culture,
      province,
      options: shuffle([culture.name, ...takeRandom(names, 3)]),
    };
  });
}

/* ------------------------------------------------------------------ */
/* 3. Kartu Ingatan: nama budaya <-> provinsi asal                     */
/* ------------------------------------------------------------------ */

export interface MemoryCard {
  id: string;
  pairId: string;
  label: string;
  kind: "budaya" | "provinsi";
}

export function buildMemoryDeck(pairs = 6): MemoryCard[] {
  const cards: MemoryCard[] = [];

  for (const province of takeRandom(PROVINCES, pairs)) {
    const pool = CULTURES.filter((c) => c.province_id === province.id);
    const culture = randomItem(pool);

    cards.push({
      id: `${culture.id}-budaya`,
      pairId: culture.id,
      label: culture.name,
      kind: "budaya",
    });
    cards.push({
      id: `${culture.id}-provinsi`,
      pairId: culture.id,
      label: province.name,
      kind: "provinsi",
    });
  }

  return shuffle(cards);
}

/* ------------------------------------------------------------------ */
/* Rekor terbaik (localStorage)                                        */
/* ------------------------------------------------------------------ */

const BEST_KEY = "bti-tantangan-best";

export function readBestScores(): Partial<Record<GameId, number>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(BEST_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<GameId, number>>) : {};
  } catch {
    return {};
  }
}

export function saveBestScore(game: GameId, xp: number): number {
  const all = readBestScores();
  const best = Math.max(all[game] ?? 0, xp);
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify({ ...all, [game]: best }));
  } catch {
    /* penyimpanan penuh / diblokir: abaikan */
  }
  return best;
}
