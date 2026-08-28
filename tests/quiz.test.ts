import { describe, expect, it } from "vitest";
import { allKana, kanaById } from "../src/lib/core/kana";
import { buildQuestions, checkTyped, eligibleKana, eligiblePairs } from "../src/lib/core/quiz";
import { similarity } from "../src/lib/core/similarity";
import { defaultSettings, type RunSettings } from "../src/lib/core/settings";

// The same characters picked in both alphabets.
function both(ids: string[]): Pick<RunSettings, "selections"> {
  return { selections: { hiragana: ids, katakana: ids } };
}

function settings(patch: Partial<RunSettings> = {}): RunSettings {
  return {
    ...defaultSettings,
    ...both(allKana.map((kana) => kana.id)),
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
      settings({ questionCount: 0, ...both(["a", "i", "u"]) }),
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
      settings({ questionCount: 5, ...both(["a", "i"]) }),
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
    expect(buildQuestions(settings({ ...both([]) }), seeded(1))).toHaveLength(0);
  });
});

describe("typed answers", () => {
  const question = buildQuestions(
    settings({ questionCount: 1, ...both(["shi"]), answerStyle: "typing" }),
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
      ...both(["shi"]),
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
      ...both(["shi"]),
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

describe("choices that can be told apart", () => {
  const wide = settings({
    questionCount: 60,
    includeDakuon: true,
    includeHandakuon: true,
    includeYoon: true,
    scripts: ["hiragana", "katakana"]
  });

  it("never offers one character twice, in either alphabet", () => {
    for (const question of buildQuestions(wide, seeded(13))) {
      const ids = question.choices.map((choice) => choice.kanaId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("never offers two options that accept the same reading", () => {
    const questions = buildQuestions({ ...wide, direction: "kana-romaji" }, seeded(17));
    for (const question of questions) {
      if (question.answer !== "romaji") continue;
      const readings = question.choices.flatMap((choice) => {
        const kana = kanaById(choice.kanaId);
        return kana === undefined ? [] : [kana.romaji, ...kana.alt];
      });
      // ぢ reads "ji" as well as "dji", so it may not sit beside じ
      expect(new Set(readings).size).toBe(readings.length);
    }
  });

  it("never offers two sounds that are pronounced the same", () => {
    const questions = buildQuestions({ ...wide, format: "text-audio" }, seeded(19));
    const alike: Record<string, string> = { dji: "ji", dzu: "zu", wo: "o" };
    for (const question of questions) {
      expect(question.answer).toBe("audio");
      const sounds = question.choices.map((choice) => {
        const romaji = kanaById(choice.kanaId)?.romaji ?? "";
        return alike[romaji] ?? romaji;
      });
      expect(new Set(sounds).size).toBe(sounds.length);
    }
  });
});

describe("a character set per alphabet", () => {
  const split = settings({
    scripts: ["hiragana", "katakana"],
    selections: { hiragana: ["ka", "ki"], katakana: ["mi", "mu"] },
    questionCount: 40
  });

  it("counts a character once per alphabet it was picked in", () => {
    expect(eligiblePairs(split)).toHaveLength(4);
    expect(eligibleKana(split)).toHaveLength(4);
    expect(eligibleKana(settings({ scripts: ["hiragana", "katakana"] }))).toHaveLength(46);
  });

  it("only ever asks a character in the alphabet it was picked in", () => {
    for (const question of buildQuestions(split, seeded(23))) {
      const wanted = question.script === "hiragana" ? ["ka", "ki"] : ["mi", "mu"];
      expect(wanted).toContain(question.kanaId);
    }
  });
});

describe("difficulty", () => {
  function closeness(runSettings: RunSettings, seed: number): number {
    const questions = buildQuestions(runSettings, seeded(seed));
    let total = 0;
    let counted = 0;
    for (const question of questions) {
      const target = kanaById(question.kanaId);
      if (target === undefined) continue;
      for (const choice of question.choices) {
        const other = kanaById(choice.kanaId);
        if (other === undefined || other.id === target.id) continue;
        total += similarity(target, question.script, other, choice.script, question.answer);
        counted += 1;
      }
    }
    return counted === 0 ? 0 : total / counted;
  }

  const base = settings({ questionCount: 60, includeDakuon: true, includeHandakuon: true });

  it("makes the wrong answers closer as it goes up", () => {
    const beginner = closeness({ ...base, difficulty: "beginner" }, 29);
    const advanced = closeness({ ...base, difficulty: "advanced" }, 29);
    const expert = closeness({ ...base, difficulty: "expert" }, 29);
    expect(advanced).toBeGreaterThan(beginner);
    expect(expert).toBeGreaterThan(advanced);
  });

  it("is ignored when too few characters are in play to have look alikes", () => {
    const few = { ...both(["a", "i", "u", "e", "o", "ka", "ki"]), questionCount: 30 };
    const beginner = closeness(settings({ ...few, difficulty: "beginner" }), 31);
    const expert = closeness(settings({ ...few, difficulty: "expert" }), 31);
    expect(expert).toBe(beginner);
  });
});

describe("filling four options", () => {
  it("reaches past the selection when the picked characters read alike", () => {
    // じ ぢ ず づ carry two readings between them, so they cannot fill four options
    const alike = settings({
      questionCount: 12,
      includeDakuon: true,
      ...both(["ji", "di", "zu", "du"])
    });
    for (const question of buildQuestions(alike, seeded(37))) {
      expect(question.choices).toHaveLength(4);
      const readings = question.choices.flatMap((choice) => {
        const kana = kanaById(choice.kanaId);
        return kana === undefined ? [] : [kana.romaji, ...kana.alt];
      });
      expect(new Set(readings).size).toBe(readings.length);
    }
  });
});
