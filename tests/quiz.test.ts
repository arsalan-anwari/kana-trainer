import { describe, expect, it } from "vitest";
import { allKana, kanaById } from "../src/lib/core/kana";
import { buildQuestions, checkTyped, eligibleKana } from "../src/lib/core/quiz";
import { defaultSettings, type RunSettings } from "../src/lib/core/settings";

function settings(patch: Partial<RunSettings> = {}): RunSettings {
  return {
    ...defaultSettings,
    selection: allKana.map((kana) => kana.id),
    ...patch
  };
}

function seeded(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

describe("quiz building", () => {
  it("keeps the extra character sets out unless asked", () => {
    expect(eligibleKana(settings())).toHaveLength(46);
    expect(eligibleKana(settings({ includeDakuon: true }))).toHaveLength(66);
    expect(eligibleKana(settings({ includeHandakuon: true }))).toHaveLength(51);
    expect(eligibleKana(settings({ includeYoon: true }))).toHaveLength(79);
  });

  it("gives every character in an audio run a clip", () => {
    const pool = eligibleKana(
      settings({
        format: "audio-text",
        includeDakuon: true,
        includeHandakuon: true,
        includeYoon: true
      })
    );
    expect(pool).toHaveLength(104);
  });

  it("builds the asked number of questions", () => {
    expect(buildQuestions(settings({ questionCount: 12 }), seeded(7))).toHaveLength(12);
  });

  it("uses one pass over the pool when the count is zero", () => {
    const questions = buildQuestions(
      settings({ questionCount: 0, selection: ["a", "i", "u"] }),
      seeded(3)
    );
    expect(questions).toHaveLength(3);
    expect(new Set(questions.map((question) => question.kanaId)).size).toBe(3);
  });

  it("offers four choices with the right answer and no repeated romaji", () => {
    const questions = buildQuestions(settings({ questionCount: 40 }), seeded(11));
    for (const question of questions) {
      expect(question.choices).toHaveLength(4);
      expect(question.choices.some((choice) => choice.kanaId === question.kanaId)).toBe(true);
      const romaji = question.choices.map((choice) => kanaById(choice.kanaId)?.romaji);
      expect(new Set(romaji).size).toBe(4);
    }
  });

  it("fills the choices even when few characters are selected", () => {
    const questions = buildQuestions(
      settings({ questionCount: 5, selection: ["a", "i"] }),
      seeded(5)
    );
    for (const question of questions) {
      expect(question.choices).toHaveLength(4);
    }
  });

  it("skips choices in typing mode", () => {
    const questions = buildQuestions(
      settings({ questionCount: 4, answerStyle: "typing" }),
      seeded(2)
    );
    expect(questions.every((question) => question.choices.length === 0)).toBe(true);
  });

  it("returns nothing when the selection is empty", () => {
    expect(buildQuestions(settings({ selection: [] }), seeded(1))).toHaveLength(0);
  });
});

describe("typed answers", () => {
  const question = buildQuestions(
    settings({ questionCount: 1, selection: ["shi"], answerStyle: "typing" }),
    seeded(9)
  )[0];

  it("accepts the main romaji", () => {
    expect(checkTyped(question, "shi")).toBe(true);
  });

  it("accepts alternate spellings and stray spacing", () => {
    expect(checkTyped(question, " SI ")).toBe(true);
  });

  it("rejects wrong answers", () => {
    expect(checkTyped(question, "chi")).toBe(false);
  });
});

describe("typed kana answers", () => {
  const question = buildQuestions(
    settings({
      questionCount: 1,
      selection: ["shi"],
      answerStyle: "typing",
      direction: "romaji-kana"
    }),
    seeded(9)
  )[0];

  it("accepts hiragana or katakana for the same kana", () => {
    expect(checkTyped(question, "し")).toBe(true);
    expect(checkTyped(question, "シ")).toBe(true);
  });

  it("rejects wrong kana", () => {
    expect(checkTyped(question, "ち")).toBe(false);
  });
});

describe("typed answers accepting either script", () => {
  const question = buildQuestions(
    settings({
      questionCount: 1,
      selection: ["shi"],
      format: "audio-text",
      answerStyle: "typing"
    }),
    seeded(9)
  )[0];

  it("accepts kana even though the question's answer side is kana", () => {
    expect(checkTyped(question, "し", true)).toBe(true);
  });

  it("also accepts romaji", () => {
    expect(checkTyped(question, "shi", true)).toBe(true);
  });

  it("still rejects wrong answers in either script", () => {
    expect(checkTyped(question, "chi", true)).toBe(false);
    expect(checkTyped(question, "ち", true)).toBe(false);
  });
});
