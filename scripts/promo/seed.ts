import { allKana, seionRows, type Script } from "../../src/lib/core/kana";
import type { Answer } from "../../src/lib/core/quiz";
import type { Report } from "../../src/lib/core/report";
import type { AnswerStyle, Format, RunSettings } from "../../src/lib/core/settings";

/**
 * A believable history behind the reports screen.
 */
const REPORT_KEY = "kana-trainer-reports";
const SETTINGS_KEY = "kana-trainer-settings";
const PREFS_KEY = "kana-trainer-prefs";

const seion = seionRows.flatMap((row) => row.kana);
const extras = allKana.filter((kana) => kana.group !== "seion");

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
  /** Days back from the day the recording pretends to happen on. */
  daysAgo: number;
  /** The hour of that day the run sat down at. */
  hour: number;
  questions: number;
  accuracy: number;
  scripts: Script[];
  format: Format;
  answerStyle: AnswerStyle;
  /** Whether the run reached past the basic characters. */
  extras: boolean;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function startOfDay(stamp: number): number {
  const date = new Date(stamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Spread over the calendar on purpose: every window the reports screen filters
 * by has runs in it, and the accuracy climbs towards today so the charts read
 * as somebody getting better.
 */
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
    extras: false
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

/**
 * When a seeded run happened. Recording at ten in the morning would otherwise
 * put this evening's practice in the future, so a run that has not happened yet
 * is pulled back behind the clock instead.
 */
function stampOf(session: Session, index: number, now: number): string {
  const sat = startOfDay(now) - session.daysAgo * DAY + session.hour * HOUR;
  return new Date(Math.min(sat, now - (index + 1) * 45 * 60 * 1000)).toISOString();
}

function history(now: number): Report[] {
  const roll = random(20260819);

  return sessions.map((session, index) => {
    const pool = session.extras ? [...seion, ...extras] : seion;
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
        includeYoon: session.extras
      },
      answers
    };
  });
}

export type SeedPayload = {
  keys: { reports: string; settings: string; prefs: string };
  reports: Report[];
  settings: RunSettings;
  prefs: { effects: boolean; theme: string };
};

export type SeedOptions = {
  /** What the seeded history counts back from, pin it to keep stills stable. */
  now?: number;
  effects?: boolean;
};

export function seedPayload(options: SeedOptions = {}): SeedPayload {
  return {
    keys: { reports: REPORT_KEY, settings: SETTINGS_KEY, prefs: PREFS_KEY },
    reports: history(options.now ?? Date.now()),
    settings,
    prefs: { effects: options.effects ?? true, theme: "light" }
  };
}

/** Runs in the page before the app boots. */
export function applySeed(payload: SeedPayload): void {
  localStorage.setItem(payload.keys.reports, JSON.stringify(payload.reports));
  localStorage.setItem(payload.keys.settings, JSON.stringify(payload.settings));
  localStorage.setItem(payload.keys.prefs, JSON.stringify(payload.prefs));
}
