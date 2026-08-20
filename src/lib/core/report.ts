import { groups, kanaById, rows, type Group, type Row, type Script } from "./kana";
import type { Answer } from "./quiz";
import type { RunSettings } from "./settings";

export type Report = {
  id: string;
  createdAt: string;
  durationMs: number;
  settings: RunSettings;
  answers: Answer[];
};

export type Summary = {
  total: number;
  correct: number;
  wrong: number;
  timedOut: number;
  accuracy: number;
  averageMs: number;
};

export type StatRow = {
  key: string;
  label: string;
  sub: string;
  total: number;
  correct: number;
  accuracy: number;
};

export function summarize(answers: Answer[]): Summary {
  const total = answers.length;
  const correct = answers.filter((answer) => answer.correct).length;
  const timedOut = answers.filter((answer) => answer.timedOut).length;
  const totalMs = answers.reduce((sum, answer) => sum + answer.elapsedMs, 0);
  return {
    total,
    correct,
    wrong: total - correct,
    timedOut,
    accuracy: total === 0 ? 0 : correct / total,
    averageMs: total === 0 ? 0 : Math.round(totalMs / total)
  };
}

function tally(
  answers: Answer[],
  keyOf: (answer: Answer) => string | null
): Map<string, { total: number; correct: number }> {
  const map = new Map<string, { total: number; correct: number }>();
  for (const answer of answers) {
    const key = keyOf(answer);
    if (key === null) continue;
    const bucket = map.get(key) ?? { total: 0, correct: 0 };
    bucket.total += 1;
    if (answer.correct) bucket.correct += 1;
    map.set(key, bucket);
  }
  return map;
}

function toStatRows(
  map: Map<string, { total: number; correct: number }>,
  label: (key: string) => { label: string; sub: string }
): StatRow[] {
  return [...map.entries()]
    .map(([key, bucket]) => ({
      key,
      ...label(key),
      total: bucket.total,
      correct: bucket.correct,
      accuracy: bucket.correct / bucket.total
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
}

export function statsByKana(answers: Answer[]): StatRow[] {
  return toStatRows(
    tally(answers, (answer) => answer.kanaId),
    (key) => {
      const kana = kanaById(key);
      return {
        label: kana ? `${kana.hira} ${kana.kata}` : key,
        sub: kana ? kana.romaji : key
      };
    }
  );
}

export function statsByRow(answers: Answer[]): StatRow[] {
  return toStatRows(
    tally(answers, (answer) => kanaById(answer.kanaId)?.row ?? null),
    (key) => {
      const row = rows.find((item) => item.id === key);
      return {
        label: row ? `${row.label} row` : key,
        sub: row ? row.kana.map((kana) => kana.hira).join("") : ""
      };
    }
  );
}

export function statsByScript(answers: Answer[]): StatRow[] {
  return toStatRows(
    tally(answers, (answer) => answer.script),
    (key) => ({ label: key === "hiragana" ? "Hiragana" : "Katakana", sub: "" })
  );
}

export function weakKanaIds(answers: Answer[], threshold = 1): string[] {
  const map = tally(answers, (answer) => answer.kanaId);
  return [...map.entries()]
    .filter(([, bucket]) => bucket.total - bucket.correct >= threshold)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
    .map(([key]) => key);
}

/** One character in one alphabet, and how often it was missed. */
export type Miss = {
  key: string;
  kanaId: string;
  script: Script;
  glyph: string;
  romaji: string;
  misses: number;
  total: number;
};

export type MissRow = {
  row: Row;
  misses: Miss[];
};

export type MissGroup = {
  group: Group;
  misses: number;
  rows: MissRow[];
};

/**
 * Every miss filed under its group and row, kept apart by alphabet: getting き
 * wrong and getting キ wrong are two different things to practise.
 */
export function missesByGroup(answers: Answer[]): MissGroup[] {
  const tally = new Map<string, Miss>();

  for (const answer of answers) {
    const kana = kanaById(answer.kanaId);
    if (kana === undefined) continue;
    const key = `${answer.kanaId}:${answer.script}`;
    const miss = tally.get(key) ?? {
      key,
      kanaId: answer.kanaId,
      script: answer.script,
      glyph: answer.script === "hiragana" ? kana.hira : kana.kata,
      romaji: kana.romaji,
      misses: 0,
      total: 0
    };
    miss.total += 1;
    if (!answer.correct) miss.misses += 1;
    tally.set(key, miss);
  }

  const missed = [...tally.values()].filter((miss) => miss.misses > 0);

  return groups.map((group) => {
    const groupRows: MissRow[] = [];
    for (const row of rows) {
      if (row.group !== group) continue;
      const inRow = missed
        .filter((miss) => kanaById(miss.kanaId)?.row === row.id)
        .sort((a, b) => b.misses - a.misses || a.romaji.localeCompare(b.romaji));
      if (inRow.length > 0) groupRows.push({ row, misses: inRow });
    }
    return {
      group,
      misses: groupRows.reduce(
        (sum, entry) => sum + entry.misses.reduce((count, miss) => count + miss.misses, 0),
        0
      ),
      rows: groupRows
    };
  });
}

export function mergeAnswers(reports: Report[]): Answer[] {
  return reports.flatMap((report) => report.answers);
}

export function scriptsUsed(report: Report): Script[] {
  return report.settings.scripts;
}

export function reportTitle(report: Report): string {
  const date = new Date(report.createdAt);
  return date.toLocaleString();
}

export const reportFilters = ["all", "today", "yesterday", "week", "month"] as const;

export type ReportFilter = (typeof reportFilters)[number];

export function reportFilterLabel(filter: ReportFilter): string {
  if (filter === "today") return "Today";
  if (filter === "yesterday") return "Yesterday";
  if (filter === "week") return "Last week";
  if (filter === "month") return "Last month";
  return "All";
}

function startOfDay(stamp: number): number {
  const date = new Date(stamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

const DAY = 24 * 60 * 60 * 1000;

/** Windows are whole local days, so "today" does not slide with the clock. */
export function filterWindow(
  filter: ReportFilter,
  now = Date.now()
): { from: number; to: number } | null {
  const today = startOfDay(now);
  if (filter === "today") return { from: today, to: today + DAY };
  if (filter === "yesterday") return { from: today - DAY, to: today };
  if (filter === "week") return { from: today - 6 * DAY, to: today + DAY };
  if (filter === "month") return { from: today - 29 * DAY, to: today + DAY };
  return null;
}

export function filterReports(
  reports: Report[],
  filter: ReportFilter,
  now = Date.now()
): Report[] {
  const window = filterWindow(filter, now);
  if (window === null) return reports;
  return reports.filter((report) => {
    const stamp = new Date(report.createdAt).getTime();
    return Number.isFinite(stamp) && stamp >= window.from && stamp < window.to;
  });
}
