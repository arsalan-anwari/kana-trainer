import { describe, expect, it } from "vitest";
import type { Answer } from "../src/lib/core/quiz";
import { statsByKana, statsByRow, summarize, weakKanaIds } from "../src/lib/core/report";

function answer(kanaId: string, correct: boolean, elapsedMs = 1000): Answer {
  return { kanaId, script: "hiragana", correct, timedOut: false, elapsedMs, given: "" };
}

const answers: Answer[] = [
  answer("a", true),
  answer("a", false),
  answer("ki", false),
  answer("ki", false),
  answer("su", true, 2000)
];

describe("report stats", () => {
  it("summarizes a run", () => {
    const summary = summarize(answers);
    expect(summary.total).toBe(5);
    expect(summary.correct).toBe(2);
    expect(summary.wrong).toBe(3);
    expect(summary.accuracy).toBeCloseTo(0.4);
    expect(summary.averageMs).toBe(1200);
  });

  it("sorts characters weakest first", () => {
    const stats = statsByKana(answers);
    expect(stats[0].key).toBe("ki");
    expect(stats[0].accuracy).toBe(0);
    expect(stats.at(-1)?.key).toBe("su");
  });

  it("groups by row", () => {
    const stats = statsByRow(answers);
    expect(stats.map((row) => row.key)).toContain("ka");
    expect(stats.find((row) => row.key === "sa")?.accuracy).toBe(1);
  });

  it("collects the characters worth practicing", () => {
    expect(weakKanaIds(answers)).toEqual(["ki", "a"]);
  });

  it("handles an empty run", () => {
    const summary = summarize([]);
    expect(summary.accuracy).toBe(0);
    expect(summary.averageMs).toBe(0);
  });
});
