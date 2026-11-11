import CULTURES_RAW from "./cultures.json";

export interface Culture {
  id: string;
  province_id: string;
  category: string;
  name: string;
  description: string;
  source: string;
}

export const CULTURES = CULTURES_RAW as Culture[];

export type QuestionType = "multiple_choice" | "yes_no" | "essay";

export interface Question {
  id: string;
  type: QuestionType;
  category: string;
  question: string;
  options?: string[];
  answer?: string;
  keywords?: string[];
  sample_answer?: string;
  explanation?: string;
}

export interface QuizData {
  province_id: string;
  province_name: string;
  region: string;
  total: number;
  summary: Record<QuestionType, number>;
  questions: Question[];
}

const CATEGORIES = ["house", "clothing", "dance", "instrument", "food", "art"];

const CATEGORY_PHRASES: Record<string, string> = {
  house: "rumah adat",
  clothing: "pakaian adat",
  dance: "tarian",
  instrument: "alat musik",
  food: "makanan",
  art: "seni dan kerajinan",
};

const REGION_LABELS: Record<string, string> = {
  Sumatra: "Sumatra",
  Java: "Jawa",
  Kalimantan: "Kalimantan",
  Sulawesi: "Sulawesi",
  BaliNusaTenggara: "Bali & Nusa Tenggara",
  Maluku: "Maluku",
  Papua: "Papua",
};

const STOPWORDS = new Set([
  "tari", "rumah", "adat", "khas", "pakaian", "baju", "kain", "tenun",
  "ukiran", "anyaman", "alat", "musik", "tradisional", "indonesia",
  "provinsi", "dan", "yang", "dari", "di", "ke", "pulau",
]);

/** PRNG sederhana (mulberry32) agar kuis selalu sama untuk satu provinsi. */
function makeRng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[], count: number): T[] {
  const pool = [...items];
  const out: T[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function shuffle<T>(rng: () => number, items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function keywords(text: string, exclude: Set<string>): string[] {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);
  const keys: string[] = [];
  for (const word of words) {
    if (word.length >= 3 && !STOPWORDS.has(word) && !exclude.has(word) && !keys.includes(word)) {
      keys.push(word);
    }
  }
  if (keys.length === 0) {
    if (cleaned) keys.push(cleaned);
  } else if (!keys.includes(cleaned)) {
    keys.unshift(cleaned);
  }
  return keys;
}

export function localCultures(provinceId: string): Culture[] {
  return CULTURES.filter((c) => c.province_id === provinceId);
}

export function localQuiz(
  provinceId: string,
  provinceName: string,
  region: string,
  allProvinces: { id: string; name: string; capital: string; region: string }[]
): QuizData | null {
  const items = localCultures(provinceId);
  if (items.length === 0) return null;

  const rng = makeRng(provinceId);
  const byCat: Record<string, Culture> = {};
  for (const item of items) byCat[item.category] = item;
  const regionLabel = REGION_LABELS[region] ?? region;

  const othersIn = (category: string) =>
    CULTURES.filter((c) => c.category === category && c.province_id !== provinceId);

  const uniqueNames = (list: Culture[]) => {
    const names: string[] = [];
    for (const c of list) if (!names.includes(c.name)) names.push(c.name);
    return names;
  };

  const multipleChoice: Question[] = [];
  const yesNo: Question[] = [];
  const essay: Question[] = [];

  for (const cat of CATEGORIES) {
    const item = byCat[cat];
    if (!item) continue;
    const phrase = CATEGORY_PHRASES[cat];
    const candidates = uniqueNames(othersIn(cat)).filter((n) => n !== item.name);
    const options = shuffle(rng, [item.name, ...pick(rng, candidates, 3)]);
    multipleChoice.push({
      id: `${provinceId}-mc-${cat}`,
      type: "multiple_choice",
      category: cat,
      question: `Apa ${phrase} khas ${provinceName}?`,
      options,
      answer: item.name,
      explanation: `${item.name}: ${item.description}`,
    });
  }

  const otherCapitals = allProvinces.filter((p) => p.id !== provinceId).map((p) => p.capital);
  const capital = allProvinces.find((p) => p.id === provinceId)?.capital ?? "";
  multipleChoice.push({
    id: `${provinceId}-mc-capital`,
    type: "multiple_choice",
    category: "province",
    question: `Apa ibu kota Provinsi ${provinceName}?`,
    options: shuffle(rng, [capital, ...pick(rng, otherCapitals, 3)]),
    answer: capital,
    explanation: `Ibu kota Provinsi ${provinceName} adalah ${capital}.`,
  });

  const allRegions = Array.from(new Set(Object.values(REGION_LABELS)));
  const otherRegions = allRegions.filter((r) => r !== regionLabel);
  multipleChoice.push({
    id: `${provinceId}-mc-region`,
    type: "multiple_choice",
    category: "province",
    question: `Provinsi ${provinceName} terletak di wilayah ...`,
    options: shuffle(rng, [regionLabel, ...pick(rng, otherRegions, 3)]),
    answer: regionLabel,
    explanation: `Provinsi ${provinceName} berada di wilayah ${regionLabel}.`,
  });

  const descCat = byCat.house ? "house" : CATEGORIES[0];
  const descItem = byCat[descCat];
  const descOptions = shuffle(rng, [
    descItem.description,
    ...pick(
      rng,
      othersIn(descCat).filter((c) => c.description !== descItem.description).map((c) => c.description),
      3
    ),
  ]);
  multipleChoice.push({
    id: `${provinceId}-mc-description`,
    type: "multiple_choice",
    category: descCat,
    question: `Apa ciri khas ${descItem.name}?`,
    options: descOptions,
    answer: descItem.description,
    explanation: `${descItem.name} adalah ${CATEGORY_PHRASES[descCat]} khas ${provinceName}.`,
  });

  CATEGORIES.forEach((cat, i) => {
    const item = byCat[cat];
    if (!item) return;
    const phrase = CATEGORY_PHRASES[cat];
    if (i % 2 === 0) {
      yesNo.push({
        id: `${provinceId}-yn-${cat}`,
        type: "yes_no",
        category: cat,
        question: `${item.name} adalah ${phrase} khas ${provinceName}.`,
        options: ["Ya", "Tidak"],
        answer: "Ya",
        explanation: `Benar. ${item.name} adalah ${phrase} khas ${provinceName}.`,
      });
    } else {
      const candidates = othersIn(cat).filter((c) => c.name !== item.name);
      const other = candidates[Math.floor(rng() * candidates.length)];
      yesNo.push({
        id: `${provinceId}-yn-${cat}`,
        type: "yes_no",
        category: cat,
        question: `${other.name} adalah ${phrase} khas ${provinceName}.`,
        options: ["Ya", "Tidak"],
        answer: "Tidak",
        explanation: `Tidak. ${other.name} bukan ${phrase} khas ${provinceName}. Yang khas ${provinceName} adalah ${item.name}.`,
      });
    }
  });

  yesNo.push({
    id: `${provinceId}-yn-capital`,
    type: "yes_no",
    category: "province",
    question: `Ibu kota Provinsi ${provinceName} adalah ${capital}.`,
    options: ["Ya", "Tidak"],
    answer: "Ya",
    explanation: `Benar. Ibu kota Provinsi ${provinceName} adalah ${capital}.`,
  });

  yesNo.push({
    id: `${provinceId}-yn-region`,
    type: "yes_no",
    category: "province",
    question: `Provinsi ${provinceName} terletak di wilayah ${regionLabel}.`,
    options: ["Ya", "Tidak"],
    answer: "Ya",
    explanation: `Benar. Provinsi ${provinceName} berada di wilayah ${regionLabel}.`,
  });

  const categoryItem = byCat.dance ?? items[0];
  const wrongCat = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
  yesNo.push({
    id: `${provinceId}-yn-category`,
    type: "yes_no",
    category: categoryItem.category,
    question: `Apakah ${categoryItem.name} termasuk ${CATEGORY_PHRASES[wrongCat]} khas ${provinceName}?`,
    options: ["Ya", "Tidak"],
    answer: "Tidak",
    explanation: `Tidak. ${categoryItem.name} adalah ${CATEGORY_PHRASES[categoryItem.category]} khas ${provinceName}.`,
  });

  const provinceTokens = new Set(provinceName.toLowerCase().match(/[a-z0-9]+/g) ?? []);

  for (const cat of CATEGORIES) {
    const item = byCat[cat];
    if (!item) continue;
    essay.push({
      id: `${provinceId}-essay-${cat}`,
      type: "essay",
      category: cat,
      question: `Sebutkan nama ${CATEGORY_PHRASES[cat]} khas ${provinceName}.`,
      keywords: keywords(item.name, provinceTokens),
      sample_answer: item.name,
      explanation: item.description,
    });
  }

  essay.push({
    id: `${provinceId}-essay-capital`,
    type: "essay",
    category: "province",
    question: `Sebutkan ibu kota Provinsi ${provinceName}.`,
    keywords: keywords(capital, provinceTokens),
    sample_answer: capital,
    explanation: `Ibu kota Provinsi ${provinceName} adalah ${capital}.`,
  });

  const artNames = ["dance", "instrument"].filter((c) => byCat[c]).map((c) => byCat[c].name);
  const artKeywords: string[] = [];
  for (const name of artNames) {
    for (const key of keywords(name, provinceTokens)) {
      if (!artKeywords.includes(key)) artKeywords.push(key);
    }
  }
  essay.push({
    id: `${provinceId}-essay-dance-instrument`,
    type: "essay",
    category: "art",
    question: `Sebutkan satu tarian atau alat musik khas ${provinceName}.`,
    keywords: artKeywords,
    sample_answer: artNames.join(" atau "),
    explanation: `Contoh jawaban: ${artNames.join(", ")}.`,
  });

  const pools: Record<QuestionType, Question[]> = {
    multiple_choice: shuffle(rng, multipleChoice),
    yes_no: shuffle(rng, yesNo),
    essay: shuffle(rng, essay),
  };
  const pattern: QuestionType[] = ["multiple_choice", "multiple_choice", "yes_no", "essay"];
  const questions: Question[] = [];
  while (pools.multiple_choice.length || pools.yes_no.length || pools.essay.length) {
    for (const qtype of pattern) {
      const item = pools[qtype].shift();
      if (item) questions.push(item);
    }
  }

  return {
    province_id: provinceId,
    province_name: provinceName,
    region: regionLabel,
    total: questions.length,
    summary: {
      multiple_choice: questions.filter((q) => q.type === "multiple_choice").length,
      yes_no: questions.filter((q) => q.type === "yes_no").length,
      essay: questions.filter((q) => q.type === "essay").length,
    },
    questions,
  };
}
