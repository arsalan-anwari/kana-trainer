import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allKana, baseRows, dakutenRows, kanaById, rows } from "../src/lib/core/kana";

describe("kana data", () => {
  it("has unique ids", () => {
    const ids = new Set(allKana.map((kana) => kana.id));
    expect(ids.size).toBe(allKana.length);
  });

  it("has 46 base characters and 25 dakuten characters", () => {
    expect(baseRows.flatMap((row) => row.kana)).toHaveLength(46);
    expect(dakutenRows.flatMap((row) => row.kana)).toHaveLength(25);
  });

  it("keeps hiragana and katakana in step", () => {
    for (const kana of allKana) {
      expect(kana.hira).not.toBe(kana.kata);
      expect(kana.romaji.length).toBeGreaterThan(0);
    }
  });

  it("gives audio to base characters only", () => {
    for (const kana of allKana) {
      if (kana.dakuten) expect(kana.audio).toBeNull();
      else expect(kana.audio).toBe(kana.romaji);
    }
  });

  it("ships an audio file for every base character", () => {
    for (const kana of allKana) {
      if (kana.audio === null) continue;
      expect(existsSync(`public/audio/kana/${kana.audio}.mp3`)).toBe(true);
    }
  });

  it("looks characters up by id", () => {
    expect(kanaById("shi")?.hira).toBe("し");
    expect(kanaById("nope")).toBeUndefined();
    expect(rows.map((row) => row.id)).toContain("pa");
  });
});
