import { describe, expect, it } from "vitest";
import {
  defaultSettings,
  enabledGroups,
  groupEnabled,
  migrateSettings,
  normalizeSettings,
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
