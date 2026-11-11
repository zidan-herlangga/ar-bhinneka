import { describe, it, expect } from "vitest";
import { PROVINCES } from "./data/provinces";
import { localCultures, localQuiz } from "./data/localData";

describe("Fallback data lokal", () => {
  it("data budaya lokal tersedia untuk semua provinsi", () => {
    PROVINCES.forEach((p) => {
      expect(localCultures(p.id).length).toBeGreaterThan(0);
    });
  });

  it("menghasilkan 26 soal per provinsi dengan pembagian 9/9/8", () => {
    PROVINCES.forEach((p) => {
      const quiz = localQuiz(p.id, p.name, p.region, PROVINCES);
      expect(quiz).not.toBeNull();
      if (!quiz) return;
      expect(quiz.total).toBe(26);
      expect(quiz.summary.multiple_choice).toBe(9);
      expect(quiz.summary.yes_no).toBe(9);
      expect(quiz.summary.essay).toBe(8);
    });
  });

  it("pilihan ganda punya 4 opsi unik dan jawaban yang valid", () => {
    PROVINCES.forEach((p) => {
      const quiz = localQuiz(p.id, p.name, p.region, PROVINCES);
      quiz?.questions
        .filter((q) => q.type === "multiple_choice")
        .forEach((q) => {
          expect(q.options?.length).toBe(4);
          expect(new Set(q.options).size).toBe(4);
          expect(q.options).toContain(q.answer);
        });
    });
  });

  it("soal isian punya kata kunci dan contoh jawaban", () => {
    PROVINCES.forEach((p) => {
      const quiz = localQuiz(p.id, p.name, p.region, PROVINCES);
      quiz?.questions
        .filter((q) => q.type === "essay")
        .forEach((q) => {
          expect((q.keywords?.length ?? 0)).toBeGreaterThan(0);
          expect(q.sample_answer).toBeTruthy();
        });
    });
  });

  it("kuis deterministik: dua kali generate menghasilkan soal yang sama", () => {
    const p = PROVINCES[0];
    const a = localQuiz(p.id, p.name, p.region, PROVINCES);
    const b = localQuiz(p.id, p.name, p.region, PROVINCES);
    expect(a?.questions.map((q) => q.id)).toEqual(b?.questions.map((q) => q.id));
  });
});
