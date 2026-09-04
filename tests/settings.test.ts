import { describe, expect, it } from "vitest";
import {
  clampCustomCount,
  copySelections,
  customCountMax,
  customCountMin,
  customCountValues,
  defaultSettings,
  enabledGroups,
  groupEnabled,
  isCustomCount,
  lookAlikeCount,
  migrateSettings,
  withPreset,
  normalizeSettings,
  questionCountOptions,
  sidesFor
} from "../src/lib/core/settings";

describe("settings rules", () => {
  it("forces multiple choice when the answer is audio", () => {
    const result = normalizeSettings({
      ...defaultSettings,
      format: "text-audio",
      answerStyle: "typing"
    });
    expect(result.settings.answerStyle).toBe("choice");
    expect(result.notes).toHaveLength(1);
  });

  it("allows either direction while typing", () => {
    const result = normalizeSettings({
      ...defaultSettings,
      answerStyle: "typing",
      direction: "romaji-kana"
    });
    expect(result.settings.direction).toBe("romaji-kana");
  });

  it("forces kana answers for audio to text regardless of answer style", () => {
    const choiceResult = normalizeSettings({
      ...defaultSettings,
      format: "audio-text",
      answerStyle: "choice",
      direction: "kana-romaji"
    });
    expect(choiceResult.settings.direction).toBe("romaji-kana");

    const typingResult = normalizeSettings({
      ...defaultSettings,
      format: "audio-text",
      answerStyle: "typing",
      direction: "kana-romaji"
    });
    expect(typingResult.settings.direction).toBe("romaji-kana");
  });

  it("forces a kana prompt for text to audio", () => {
    const result = normalizeSettings({
      ...defaultSettings,
      format: "text-audio",
      direction: "romaji-kana"
    });
    expect(result.settings.direction).toBe("kana-romaji");
  });

  it("keeps the extra character sets in audio modes", () => {
    const result = normalizeSettings({
      ...defaultSettings,
      format: "audio-text",
      includeDakuon: true,
      includeHandakuon: true,
      includeYoon: true
    });
    expect(result.settings.includeDakuon).toBe(true);
    expect(result.settings.includeHandakuon).toBe(true);
    expect(result.settings.includeYoon).toBe(true);
  });

  it("always leaves one alphabet on", () => {
    const result = normalizeSettings({ ...defaultSettings, scripts: [] });
    expect(result.settings.scripts).toEqual(["hiragana"]);
  });

  it("maps formats to prompt and answer sides", () => {
    expect(sidesFor("text-text", "kana-romaji", 0)).toEqual({
      prompt: "kana",
      answer: "romaji"
    });
    expect(sidesFor("text-text", "romaji-kana", 0)).toEqual({
      prompt: "romaji",
      answer: "kana"
    });
    expect(sidesFor("audio-text", "kana-romaji", 0)).toEqual({
      prompt: "audio",
      answer: "romaji"
    });
    expect(sidesFor("text-audio", "romaji-kana", 0)).toEqual({
      prompt: "romaji",
      answer: "audio"
    });
    expect(sidesFor("text-text", "mixed", 0.9)).toEqual({
      prompt: "romaji",
      answer: "kana"
    });
  });
});

describe("character groups", () => {
  it("always keeps seion on", () => {
    expect(groupEnabled(defaultSettings, "seion")).toBe(true);
    expect(enabledGroups(defaultSettings)).toEqual(["seion"]);
  });

  it("reports the groups that are switched on", () => {
    const settings = { ...defaultSettings, includeDakuon: true, includeYoon: true };
    expect(enabledGroups(settings)).toEqual(["seion", "dakuon", "yoon"]);
    expect(groupEnabled(settings, "handakuon")).toBe(false);
  });

  it("turns an old dakuten setting into dakuon and handakuon", () => {
    const migrated = migrateSettings({ includeDakuten: true, questionCount: 30 });
    expect(migrated.includeDakuon).toBe(true);
    expect(migrated.includeHandakuon).toBe(true);
    expect(migrated.includeYoon).toBe(false);
    expect(migrated.questionCount).toBe(30);
    expect("includeDakuten" in migrated).toBe(false);
  });
});

describe("stored settings", () => {
  it("gives an old shared character list to both alphabets", () => {
    const migrated = migrateSettings({ selection: ["ka", "ki"] });
    expect(migrated.selections.hiragana).toEqual(["ka", "ki"]);
    expect(migrated.selections.katakana).toEqual(["ka", "ki"]);
    expect("selection" in migrated).toBe(false);
  });

  it("keeps two lists that were already stored apart", () => {
    const migrated = migrateSettings({
      selections: { hiragana: ["ka"], katakana: ["mi"] }
    });
    expect(migrated.selections.hiragana).toEqual(["ka"]);
    expect(migrated.selections.katakana).toEqual(["mi"]);
  });

  it("fills in a difficulty for runs saved before it existed", () => {
    expect(migrateSettings({ questionCount: 10 }).difficulty).toBe("beginner");
  });
});

describe("question counts", () => {
  it("offers ten presets over two rows", () => {
    expect(questionCountOptions).toEqual([10, 20, 30, 40, 50, 60, 80, 100, 150, 200]);
  });

  it("rolls from 10 to 500 in steps of ten", () => {
    expect(customCountValues[0]).toBe(customCountMin);
    expect(customCountValues.at(-1)).toBe(customCountMax);
    expect(customCountValues).toHaveLength(50);
  });

  it("snaps a typed count onto the step and inside the range", () => {
    expect(clampCustomCount(117)).toBe(120);
    expect(clampCustomCount(4)).toBe(customCountMin);
    expect(clampCustomCount(9000)).toBe(customCountMax);
    expect(clampCustomCount(Number.NaN)).toBe(customCountMin);
  });

  it("only calls a count custom when no chip covers it", () => {
    expect(isCustomCount(70)).toBe(true);
    expect(isCustomCount(50)).toBe(false);
    expect(isCustomCount(0)).toBe(false);
  });
});

describe("difficulty", () => {
  it("decides how many wrong answers are look alikes", () => {
    expect(lookAlikeCount("beginner")).toBe(0);
    expect(lookAlikeCount("advanced")).toBe(1);
    expect(lookAlikeCount("expert")).toBe(3);
  });
});

describe("presets", () => {
  const set = (name: string) => ({ name, selections: copySelections({ hiragana: [name] }) });

  it("keeps one preset per name, sorted", () => {
    const list = withPreset(withPreset([set("b")], set("a")), {
      name: "b",
      selections: copySelections({ katakana: ["ka"] })
    });
    expect(list.map((preset) => preset.name)).toEqual(["a", "b"]);
    expect(list[1].selections).toEqual({ hiragana: [], katakana: ["ka"] });
  });

  it("copies the arrays it stores", () => {
    const selections = { hiragana: ["a"], katakana: ["ka"] };
    const copy = copySelections(selections);
    copy.hiragana.push("i");
    expect(selections.hiragana).toEqual(["a"]);
  });
});
