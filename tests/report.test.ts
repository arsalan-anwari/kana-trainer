import { describe, expect, it } from "vitest";
import type { Answer } from "../src/lib/core/quiz";
import {
  filterReports,
  missesByGroup,
  statsByKana,
  statsByRow,
  summarize,
  weakKanaIds,
  type Report
} from "../src/lib/core/report";
import { defaultSettings } from "../src/lib/core/settings";

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

function at(iso: string, kanaId = "a", correct = false): Report {
  return {
    id: iso,
    createdAt: iso,
    durationMs: 1000,
    settings: defaultSettings,
    answers: [{ kanaId, script: "hiragana", correct, timedOut: false, elapsedMs: 900, given: "" }]
  };
}

describe("report filters", () => {
  // fixed local noon, so no window lands on a day boundary
  const now = new Date(2026, 7, 20, 12, 0, 0).getTime();
  const day = 24 * 60 * 60 * 1000;

  const reports = [
    at(new Date(now).toISOString()),
    at(new Date(now - day).toISOString()),
    at(new Date(now - 4 * day).toISOString()),
    at(new Date(now - 20 * day).toISOString()),
    at(new Date(now - 90 * day).toISOString())
  ];

  it("keeps everything when nothing is filtered", () => {
    expect(filterReports(reports, "all", now)).toHaveLength(5);
  });

  it("cuts to whole local days", () => {
    expect(filterReports(reports, "today", now)).toHaveLength(1);
    expect(filterReports(reports, "yesterday", now)).toHaveLength(1);
    expect(filterReports(reports, "week", now)).toHaveLength(3);
  });

  it("takes a hand picked window with both ends included", () => {
    // 2026-07-22 through 2026-08-20 is the 30 day window the month chip used
    const range = { from: "2026-07-22", to: "2026-08-20" };
    expect(filterReports(reports, range, now)).toHaveLength(4);
    // the run 20 days back, on its own day, both ends inclusive
    expect(filterReports(reports, { from: "2026-07-31", to: "2026-07-31" }, now)).toHaveLength(1);
    // ends the wrong way round still name the same window
    expect(filterReports(reports, { from: range.to, to: range.from }, now)).toHaveLength(4);
  });

  it("keeps everything when a hand picked window is unreadable", () => {
    expect(filterReports(reports, { from: "nope", to: "2026-08-20" }, now)).toHaveLength(5);
  });

  it("drops runs with an unreadable date", () => {
    expect(
      filterReports([at("not a date")], { from: "2026-07-22", to: "2026-08-20" }, now)
    ).toHaveLength(0);
  });
});

describe("mistakes by group", () => {
  const misses: Answer[] = [
    answer("ki", false),
    answer("ki", false),
    answer("ka", true),
    { ...answer("ki", false), script: "katakana" },
    { ...answer("ga", false), script: "hiragana" }
  ];

  it("returns one box per group, whether or not it has misses", () => {
    const boxes = missesByGroup(misses);
    expect(boxes.map((box) => box.group)).toEqual([
      "seion",
      "dakuon",
      "handakuon",
      "yoon"
    ]);
  });

  it("keeps the two alphabets apart", () => {
    const seion = missesByGroup(misses)[0];
    const ka = seion.rows.find((entry) => entry.row.id === "ka");
    expect(ka?.misses.map((miss) => miss.glyph)).toEqual(["き", "キ"]);
    expect(ka?.misses.map((miss) => miss.misses)).toEqual([2, 1]);
  });

  it("leaves out characters that were always right", () => {
    const rowIds = missesByGroup(misses)[0].rows.flatMap((entry) =>
      entry.misses.map((miss) => miss.kanaId)
    );
    expect(rowIds).not.toContain("ka");
  });

  it("counts each group's misses", () => {
    const boxes = missesByGroup(misses);
    expect(boxes[0].misses).toBe(3);
    expect(boxes[1].misses).toBe(1);
    expect(boxes[3].misses).toBe(0);
  });
});
