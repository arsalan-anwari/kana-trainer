import { baseRows } from "../../src/lib/core/kana";
import type { Answer } from "../../src/lib/core/quiz";
import type { Report } from "../../src/lib/core/report";
import type { RunSettings } from "../../src/lib/core/settings";

/**
 * The reports screen and the "my weak spots" button
 */
const REPORT_KEY = "kana-trainer-reports";
const SETTINGS_KEY = "kana-trainer-settings";
const PREFS_KEY = "kana-trainer-prefs";

const pool = baseRows.flatMap((row) => row.kana);

function random(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const settings: RunSettings = {
  scripts: ["hiragana"],
  format: "text-text",
  answerStyle: "choice",
  direction: "kana-romaji",
  includeDakuten: false,
  selection: pool.map((kana) => kana.id),
  questionCount: 10,
  perQuestionSeconds: 0,
  totalSeconds: 0
};

function history(): Report[] {
  const roll = random(20260819);
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  return [0, 1, 2, 3, 4, 5].map((index) => {
    const accuracy = 0.58 + index * 0.06;
    const answers: Answer[] = [];

    for (let question = 0; question < 20; question += 1) {
      const kana = pool[Math.floor(roll() * pool.length)];
      const correct = roll() < accuracy;
      answers.push({
        kanaId: kana.id,
        script: roll() < 0.65 ? "hiragana" : "katakana",
        correct,
        timedOut: !correct && roll() < 0.2,
        elapsedMs: Math.round(1400 + roll() * 3200),
        given: correct ? kana.romaji : pool[Math.floor(roll() * pool.length)].romaji
      });
    }

    return {
      id: `promo-${index}`,
      createdAt: new Date(now - (13 - index * 2) * day - Math.floor(roll() * 6) * 3600_000)
        .toISOString(),
      durationMs: answers.reduce((sum, answer) => sum + answer.elapsedMs, 0),
      settings: { ...settings, scripts: index % 3 === 0 ? ["hiragana", "katakana"] : ["hiragana"] },
      answers
    };
  });
}

export type SeedPayload = {
  keys: { reports: string; settings: string; prefs: string };
  reports: Report[];
  settings: RunSettings;
};

export function seedPayload(): SeedPayload {
  return {
    keys: { reports: REPORT_KEY, settings: SETTINGS_KEY, prefs: PREFS_KEY },
    reports: history(),
    settings
  };
}

/** Runs in the page before the app boots. */
export function applySeed(payload: SeedPayload): void {
  localStorage.setItem(payload.keys.reports, JSON.stringify(payload.reports));
  localStorage.setItem(payload.keys.settings, JSON.stringify(payload.settings));
  localStorage.setItem(payload.keys.prefs, JSON.stringify({ effects: true, theme: "light" }));
}
