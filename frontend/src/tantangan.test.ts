import { beforeEach, describe, expect, it } from "vitest";
import {
  buildJodohkanRounds,
  buildMemoryDeck,
  buildPetunjukRounds,
  readBestScores,
  saveBestScore,
} from "./lib/tantangan";

describe("Tantangan Budaya", () => {
  it("Jodohkan: setiap ronde punya budaya, provinsi asal, dan 4 opsi unik", () => {
    const rounds = buildJodohkanRounds(8);

    expect(rounds).toHaveLength(8);
    expect(new Set(rounds.map((r) => r.province.id)).size).toBe(8);

    rounds.forEach((round) => {
      expect(round.culture.province_id).toBe(round.province.id);
      expect(round.options).toHaveLength(4);
      expect(new Set(round.options.map((o) => o.id)).size).toBe(4);
      expect(round.options.map((o) => o.id)).toContain(round.province.id);
    });
  });

  it("Petunjuk: opsi berupa 4 nama budaya unik dan memuat jawaban benar", () => {
    const rounds = buildPetunjukRounds(8);

    expect(rounds).toHaveLength(8);

    rounds.forEach((round) => {
      expect(round.options).toHaveLength(4);
      expect(new Set(round.options).size).toBe(4);
      expect(round.options).toContain(round.culture.name);
    });
  });

  it("Ingatan: dek berisi pasangan budaya dan provinsi yang cocok", () => {
    const deck = buildMemoryDeck(6);

    expect(deck).toHaveLength(12);

    const pairIds = new Set(deck.map((card) => card.pairId));
    expect(pairIds.size).toBe(6);

    pairIds.forEach((pairId) => {
      const cards = deck.filter((card) => card.pairId === pairId);
      expect(cards).toHaveLength(2);
      expect(cards.map((card) => card.kind).sort()).toEqual(["budaya", "provinsi"]);
    });
  });

  describe("rekor terbaik", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("menyimpan rekor tertinggi per permainan", () => {
      expect(readBestScores()).toEqual({});

      saveBestScore("jodohkan", 30);
      expect(saveBestScore("jodohkan", 20)).toBe(30);
      expect(saveBestScore("jodohkan", 40)).toBe(40);
      expect(readBestScores()).toEqual({ jodohkan: 40 });
    });
  });
});
