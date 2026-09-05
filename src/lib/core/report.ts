import {
  glyph,
  groupInScript,
  groups,
  kanaById,
  rows,
  type Group,
  type Row,
  type Script
} from "./kana";
import type { Answer } from "./quiz";
import {
  answerStyleLabel,
  formatLabel,
  type AnswerStyle,
  type Format,
  type RunSettings
} from "./settings";
import { t } from "../i18n.svelte";
import { rowLabel } from "../labels";

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

// Without an alphabet both glyphs are shown side by side, with one only the
// glyph the run actually drilled.
export function statsByKana(answers: Answer[], script?: Script): StatRow[] {
  return toStatRows(
    tally(answers, (answer) => answer.kanaId),
    (key) => {
      const kana = kanaById(key);
      if (kana === undefined) return { label: key, sub: key };
      return {
        label: script === undefined ? `${kana.hira} ${kana.kata}` : glyph(kana, script),
        sub: kana.romaji
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
        label: row ? rowLabel(row) : key,
        sub: row ? row.kana.map((kana) => kana.hira).join("") : ""
      };
    }
  );
}

export function weakKanaIds(answers: Answer[], threshold = 1): string[] {
  const map = tally(answers, (answer) => answer.kanaId);
  return [...map.entries()]
    .filter(([, bucket]) => bucket.total - bucket.correct >= threshold)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
    .map(([key]) => key);
}

// One character in one alphabet, and how often it was missed.
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

// Groups every miss by group and row, kept apart by alphabet.
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

export const reportFilters = ["all", "today", "yesterday", "week"] as const;

// A window the reader picked by hand, both ends inclusive whole local days,
// each written as YYYY-MM-DD the way an <input type="date"> reports it.
export type DateRange = { from: string; to: string };

export type ReportFilter = (typeof reportFilters)[number] | DateRange;

export function isDateRange(filter: ReportFilter): filter is DateRange {
  return typeof filter !== "string";
}

// YYYY-MM-DD for the local day a stamp falls in.
export function dayKey(stamp: number): string {
  const date = new Date(stamp);
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Local midnight of a YYYY-MM-DD key. Date.parse would read it as UTC, which
// slides the window by a day either side of the meridian.
function dayStart(key: string): number {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (parts === null) return Number.NaN;
  return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])).getTime();
}

// DD/MM/YYYY as it is typed. Digits carry the value, the slashes only appear
// between groups that exist, so erasing a digit takes its slash with it.
export function maskDay(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
    .filter((part) => part !== "")
    .join("/");
}

// The day key a finished DD/MM/YYYY names, or "" when it names no real day.
export function dayKeyFromInput(text: string): string {
  const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (parts === null) return "";
  const key = `${parts[3]}-${parts[2]}-${parts[1]}`;
  // a rolled over date (31/02) comes back as a different day
  return dayKey(dayStart(key)) === key ? key : "";
}

// A day key written the way the typed field shows it.
export function dayInputText(key: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return parts === null ? "" : `${parts[3]}/${parts[2]}/${parts[1]}`;
}

export function reportFilterLabel(filter: ReportFilter): string {
  if (isDateRange(filter)) {
    return filter.from === filter.to
      ? filter.from
      : t("reports.window.range", { from: filter.from, to: filter.to });
  }
  return t(`reports.window.${filter}`);
}

function startOfDay(stamp: number): number {
  const date = new Date(stamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

const DAY = 24 * 60 * 60 * 1000;

// How far back the hand picked window may reach.
export const rangeDays = 365;

// Filters reports to a window of whole local days.
export function filterWindow(
  filter: ReportFilter,
  now = Date.now()
): { from: number; to: number } | null {
  if (isDateRange(filter)) {
    const from = dayStart(filter.from);
    const to = dayStart(filter.to);
    if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
    return { from: Math.min(from, to), to: Math.max(from, to) + DAY };
  }
  const today = startOfDay(now);
  if (filter === "today") return { from: today, to: today + DAY };
  if (filter === "yesterday") return { from: today - DAY, to: today };
  if (filter === "week") return { from: today - 6 * DAY, to: today + DAY };
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

// ---------------------------------------------------------------------------
// Tags
//
// A run carries the two badges its card shows, taken straight from the settings
// it ran with: the question format and how it was answered.
// ---------------------------------------------------------------------------

export type ReportTag = Format | AnswerStyle;

export const formatTags: Format[] = ["text-text", "audio-text", "text-audio"];
export const answerStyleTags: AnswerStyle[] = ["choice", "typing"];

export function tagLabel(tag: ReportTag): string {
  return tag === "choice" || tag === "typing" ? answerStyleLabel(tag) : formatLabel(tag);
}

export function tagsOf(report: Report): ReportTag[] {
  return [report.settings.format, report.settings.answerStyle];
}

// Which alphabets a run had switched on. "both" is its own bucket rather than
// hiragana plus katakana, a mixed run drills the pair against each other and
// reads nothing like two single alphabet runs.
export const alphabetFilters = ["any", "hiragana", "katakana", "both"] as const;

export type AlphabetFilter = (typeof alphabetFilters)[number];

export function alphabetLabel(filter: AlphabetFilter): string {
  return t(`common.${filter}`);
}

export function alphabetOf(report: Report): Exclude<AlphabetFilter, "any"> {
  const hiragana = report.settings.scripts.includes("hiragana");
  const katakana = report.settings.scripts.includes("katakana");
  if (hiragana && katakana) return "both";
  return katakana ? "katakana" : "hiragana";
}

// Everything holding the report view down at once.
export type ReportQuery = {
  window: ReportFilter;
  tags: ReportTag[];
  alphabet: AlphabetFilter;
};

export const anyQuery: ReportQuery = { window: "all", tags: [], alphabet: "any" };

export function isEmptyQuery(query: ReportQuery): boolean {
  return query.window === "all" && query.tags.length === 0 && query.alphabet === "any";
}

// How many knobs are turned, for the badge on the collapsed filter panel.
export function queryTagCount(query: ReportQuery): number {
  return query.tags.length + (query.alphabet === "any" ? 0 : 1);
}

// Tags inside one dimension widen the match, tags across dimensions narrow it:
// picking both audio formats keeps either of them, adding "typing" then keeps
// only the typed ones.
function tagsMatch(report: Report, tags: ReportTag[]): boolean {
  const formats = tags.filter((tag): tag is Format => formatTags.includes(tag as Format));
  const styles = tags.filter((tag): tag is AnswerStyle =>
    answerStyleTags.includes(tag as AnswerStyle)
  );
  if (formats.length > 0 && !formats.includes(report.settings.format)) return false;
  if (styles.length > 0 && !styles.includes(report.settings.answerStyle)) return false;
  return true;
}

export function queryReports(
  reports: Report[],
  query: ReportQuery,
  now = Date.now()
): Report[] {
  return filterReports(reports, query.window, now).filter(
    (report) =>
      tagsMatch(report, query.tags) &&
      (query.alphabet === "any" || alphabetOf(report) === query.alphabet)
  );
}

// The window on its own, for the heading. A hand picked range is only ever
// "Custom", the dates themselves are too long to sit in a heading.
export function windowLabel(filter: ReportFilter): string {
  return isDateRange(filter) ? t("reports.window.custom") : reportFilterLabel(filter);
}

// Every tag holding the view down, in a fixed order rather than the order they
// were clicked, so the same view always reads the same way. These sit under the
// heading as boxes, the same ones a run card carries.
export function queryLabels(query: ReportQuery): string[] {
  return [
    ...formatTags.filter((tag) => query.tags.includes(tag)).map(tagLabel),
    ...answerStyleTags.filter((tag) => query.tags.includes(tag)).map(tagLabel),
    ...(query.alphabet === "any" ? [] : [alphabetLabel(query.alphabet)])
  ];
}

// The alphabets that actually show up in a pile of answers, so a view narrowed
// to one of them draws one chart instead of half an empty comparison.
export function scriptsSeen(answers: Answer[]): Script[] {
  const order: Script[] = ["hiragana", "katakana"];
  return order.filter((script) => answers.some((answer) => answer.script === script));
}

// ---------------------------------------------------------------------------
// Row heat
//
// The gojuon table as the reader knows it: one line per row, every character in
// the row kept in place so a gap reads as "never came up" instead of vanishing.
// ---------------------------------------------------------------------------

export type HeatCell = {
  key: string;
  glyph: string;
  romaji: string;
  total: number;
  correct: number;
  accuracy: number;
};

export type HeatRow = {
  id: string;
  label: string;
  group: Group;
  total: number;
  correct: number;
  accuracy: number;
  cells: HeatCell[];
};

export function heatByRow(answers: Answer[], script: Script): HeatRow[] {
  const counts = tally(
    answers.filter((answer) => answer.script === script),
    (answer) => answer.kanaId
  );

  const heat: HeatRow[] = [];
  for (const row of rows) {
    if (!groupInScript(row.group, script)) continue;
    const cells = row.kana.map((kana) => {
      const bucket = counts.get(kana.id) ?? { total: 0, correct: 0 };
      return {
        key: kana.id,
        glyph: glyph(kana, script),
        romaji: kana.romaji,
        total: bucket.total,
        correct: bucket.correct,
        accuracy: bucket.total === 0 ? 0 : bucket.correct / bucket.total
      };
    });
    const total = cells.reduce((sum, cell) => sum + cell.total, 0);
    // a row nobody touched is an empty line, not information
    if (total === 0) continue;
    const correct = cells.reduce((sum, cell) => sum + cell.correct, 0);
    heat.push({
      id: row.id,
      label: rowLabel(row),
      group: row.group,
      total,
      correct,
      accuracy: correct / total,
      cells
    });
  }
  return heat;
}
