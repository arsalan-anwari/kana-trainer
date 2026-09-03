import { allKana, seionRows, type Script } from "../../src/lib/core/kana";
import type { Answer } from "../../src/lib/core/quiz";
import type { Prefs } from "../../src/lib/core/prefs";
import type { Report } from "../../src/lib/core/report";
import type { AnswerStyle, Format, RunSettings } from "../../src/lib/core/settings";

// Seeded report history and settings for the recordings.
const REPORT_KEY = "kana-trainer-reports";
const SETTINGS_KEY = "kana-trainer-settings";
const PREFS_KEY = "kana-trainer-prefs";

const seion = seionRows.flatMap((row) => row.kana);
// tokushon is katakana only, so it is held back for the katakana runs
const extras = allKana.filter((kana) => kana.group !== "seion" && kana.group !== "tokushon");
const tokushon = allKana.filter((kana) => kana.group === "tokushon");

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
  includeDakuon: false,
  includeHandakuon: false,
  includeYoon: false,
  includeTokushon: false,
  selections: {
    hiragana: seion.map((kana) => kana.id),
    katakana: seion.map((kana) => kana.id)
  },
  questionCount: 10,
  difficulty: "beginner",
  perQuestionSeconds: 0,
  totalSeconds: 0
};

type Session = {
  // days back from the day the recording runs on
  daysAgo: number;
  // hour of that day the run started at
  hour: number;
  questions: number;
  accuracy: number;
  scripts: Script[];
  format: Format;
  answerStyle: AnswerStyle;
  // whether the run included the non seion characters
  extras: boolean;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function startOfDay(stamp: number): number {
  const date = new Date(stamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

// Runs spread over the calendar, with accuracy climbing towards today.
const sessions: Session[] = [
  {
    daysAgo: 0,
    hour: 18.5,
    questions: 20,
    accuracy: 0.9,
    scripts: ["hiragana", "katakana"],
    format: "text-text",
    answerStyle: "choice",
    extras: true
  },
  {
    daysAgo: 0,
    hour: 14,
    questions: 10,
    accuracy: 0.86,
    scripts: ["hiragana"],
    format: "audio-text",
    answerStyle: "typing",
    extras: false
  },
  {
    daysAgo: 1,
    hour: 19.5,
    questions: 20,
    accuracy: 0.82,
    scripts: ["hiragana", "katakana"],
    format: "text-audio",
    answerStyle: "choice",
    extras: true
  },
  {
    daysAgo: 2,
    hour: 21,
    questions: 20,
    accuracy: 0.78,
    scripts: ["katakana"],
    format: "text-text",
    answerStyle: "choice",
    extras: true
  },
  {
    daysAgo: 4,
    hour: 18,
    questions: 30,
    accuracy: 0.72,
    scripts: ["hiragana", "katakana"],
    format: "text-text",
    answerStyle: "typing",
    extras: true
  },
  {
    daysAgo: 6,
    hour: 20,
    questions: 20,
    accuracy: 0.68,
    scripts: ["hiragana"],
    format: "audio-text",
    answerStyle: "typing",
    extras: false
  },
  {
    daysAgo: 11,
    hour: 19,
    questions: 20,
    accuracy: 0.62,
    scripts: ["hiragana"],
    format: "text-text",
    answerStyle: "choice",
    extras: false
  },
  {
    daysAgo: 19,
    hour: 22,
    questions: 10,
    accuracy: 0.55,
    scripts: ["hiragana"],
    format: "text-text",
    answerStyle: "choice",
    extras: false
  }
];

// Timestamp of a seeded run, clamped to before the current clock.
function stampOf(session: Session, index: number, now: number): string {
  const sat = startOfDay(now) - session.daysAgo * DAY + session.hour * HOUR;
  return new Date(Math.min(sat, now - (index + 1) * 45 * 60 * 1000)).toISOString();
}

function history(now: number): Report[] {
  const roll = random(20260819);

  return sessions.map((session, index) => {
    const katakanaOnly = session.scripts.length === 1 && session.scripts[0] === "katakana";
    const pool = session.extras
      ? [...seion, ...extras, ...(katakanaOnly ? tokushon : [])]
      : seion;
    const answers: Answer[] = [];

    for (let question = 0; question < session.questions; question += 1) {
      const kana = pool[Math.floor(roll() * pool.length)];
      const correct = roll() < session.accuracy;
      answers.push({
        kanaId: kana.id,
        script:
          session.scripts.length === 1
            ? session.scripts[0]
            : roll() < 0.65
              ? "hiragana"
              : "katakana",
        correct,
        timedOut: !correct && roll() < 0.2,
        elapsedMs: Math.round(1400 + roll() * 3200),
        given: correct ? kana.romaji : pool[Math.floor(roll() * pool.length)].romaji
      });
    }

    return {
      id: `promo-${index}`,
      createdAt: stampOf(session, index, now),
      durationMs: answers.reduce((sum, answer) => sum + answer.elapsedMs, 0),
      settings: {
        ...settings,
        scripts: session.scripts,
        format: session.format,
        answerStyle: session.answerStyle,
        questionCount: session.questions,
        includeDakuon: session.extras,
        includeHandakuon: session.extras,
        includeYoon: session.extras,
        includeTokushon: session.extras && katakanaOnly
      },
      answers
    };
  });
}

export type SeedPayload = {
  keys: { reports: string; settings: string; prefs: string };
  reports: Report[];
  settings: RunSettings;
  prefs: Prefs;
};

export type SeedOptions = {
  // what the seeded history counts back from
  now?: number;
  effects?: boolean;
};

export function seedPayload(options: SeedOptions = {}): SeedPayload {
  return {
    keys: { reports: REPORT_KEY, settings: SETTINGS_KEY, prefs: PREFS_KEY },
    reports: history(options.now ?? Date.now()),
    settings,
    // pinned so a recording never picks up a local theme or zoom level
    prefs: { effects: options.effects ?? true, theme: "light", contrast: false, zoom: 1 }
  };
}

// Writes the seeded state to local storage before the app boots.
export function applySeed(payload: SeedPayload): void {
  localStorage.setItem(payload.keys.reports, JSON.stringify(payload.reports));
  localStorage.setItem(payload.keys.settings, JSON.stringify(payload.settings));
  localStorage.setItem(payload.keys.prefs, JSON.stringify(payload.prefs));
}
