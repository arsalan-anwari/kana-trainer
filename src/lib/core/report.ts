import { kanaById, rows, type Script } from "./kana";
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
