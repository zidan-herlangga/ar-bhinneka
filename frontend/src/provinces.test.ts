import { describe, it, expect } from "vitest";
import { PROVINCES } from "./data/provinces";

describe("Provinces data", () => {
  it("has 38 provinces", () => {
    expect(PROVINCES.length).toBe(38);
  });
  it("all provinces have region", () => {
    PROVINCES.forEach((p) => expect(p.region).toBeTruthy());
  });
});