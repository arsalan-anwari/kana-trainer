import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  allKana,
  dakuonRows,
  handakuonRows,
  kanaById,
  rows,
  seionRows,
  yoonRows
} from "../src/lib/core/kana";

describe("kana data", () => {
  it("has unique ids", () => {
    const ids = new Set(allKana.map((kana) => kana.id));
    expect(ids.size).toBe(allKana.length);
  });

  it("covers every group of the dataset", () => {
    expect(seionRows.flatMap((row) => row.kana)).toHaveLength(46);
    expect(dakuonRows.flatMap((row) => row.kana)).toHaveLength(20);
    expect(handakuonRows.flatMap((row) => row.kana)).toHaveLength(5);
    expect(yoonRows.flatMap((row) => row.kana)).toHaveLength(33);
    expect(allKana).toHaveLength(104);
  });

  it("keeps hiragana and katakana in step", () => {
    for (const kana of allKana) {
      expect(kana.hira).not.toBe(kana.kata);
      expect(kana.romaji.length).toBeGreaterThan(0);
    }
  });

  it("files every character under its own group", () => {
    for (const kana of allKana) {
      expect(kana.audio.startsWith(`${kana.group}/`)).toBe(true);
    }
  });

  it("ships an audio file for every character", () => {
    for (const kana of allKana) {
      expect(existsSync(`data/audio/${kana.audio}.mp3`)).toBe(true);
    }
  });

  it("uses every clip in the dataset exactly once", () => {
    const clips = allKana.map((kana) => kana.audio);
    expect(new Set(clips).size).toBe(clips.length);
  });

  it("looks characters up by id", () => {
    expect(kanaById("shi")?.hira).toBe("し");
    expect(kanaById("kya")?.hira).toBe("きゃ");
    expect(kanaById("nope")).toBeUndefined();
    expect(rows.map((row) => row.id)).toContain("pa");
    expect(rows.map((row) => row.id)).toContain("ja");
  });
});
