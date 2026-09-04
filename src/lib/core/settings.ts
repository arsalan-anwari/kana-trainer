import type { Group, Script } from "./kana";

export type Format = "text-text" | "audio-text" | "text-audio";
export type AnswerStyle = "choice" | "typing";
export type Direction = "kana-romaji" | "romaji-kana" | "mixed";
export type Side = "kana" | "romaji" | "audio";
export type Difficulty = "beginner" | "advanced" | "expert";

// One selected set of characters per alphabet.
export type Selections = Record<Script, string[]>;

export type RunSettings = {
  scripts: Script[];
  format: Format;
  answerStyle: AnswerStyle;
  direction: Direction;
  includeDakuon: boolean;
  includeHandakuon: boolean;
  includeYoon: boolean;
  includeTokushon: boolean;
  selections: Selections;
  questionCount: number;
  difficulty: Difficulty;
  perQuestionSeconds: number;
  totalSeconds: number;
};

export type LegacySettings = Partial<Omit<RunSettings, "selections">> & {
  includeDakuten?: boolean;
  // pre-1.3 runs kept a single list shared by both alphabets
  selection?: string[];
  selections?: Partial<Selections>;
};

export const optionalGroups = ["dakuon", "handakuon", "yoon", "tokushon"] as const;

export type OptionalGroup = (typeof optionalGroups)[number];

export const perQuestionOptions = [0, 5, 10, 15, 30];
export const totalTimeOptions = [0, 60, 120, 300, 600];

// Preset counts, as the two rows of five the setup screen draws.
export const questionCountRows = [
  [10, 20, 30, 40, 50],
  [60, 80, 100, 150, 200]
];
export const questionCountOptions = questionCountRows.flat();

export const customCountMin = 10;
export const customCountMax = 500;
export const customCountStep = 10;

export const customCountValues = Array.from(
  { length: (customCountMax - customCountMin) / customCountStep + 1 },
  (_, index) => customCountMin + index * customCountStep
);

export const difficulties = ["beginner", "advanced", "expert"] as const;

// Below this pool size the difficulty is ignored and choices stay random.
export const difficultyMinPool = 15;

export const defaultSettings: RunSettings = {
  scripts: ["hiragana"],
  format: "text-text",
  answerStyle: "choice",
  direction: "kana-romaji",
  includeDakuon: false,
  includeHandakuon: false,
  includeYoon: false,
  includeTokushon: false,
  selections: { hiragana: [], katakana: [] },
  questionCount: 20,
  difficulty: "beginner",
  perQuestionSeconds: 0,
  totalSeconds: 0
};

const groupFlags: Record<OptionalGroup, keyof RunSettings> = {
  dakuon: "includeDakuon",
  handakuon: "includeHandakuon",
  yoon: "includeYoon",
  tokushon: "includeTokushon"
};

export function groupFlag(group: OptionalGroup): keyof RunSettings {
  return groupFlags[group];
}

export function groupEnabled(settings: RunSettings, group: Group): boolean {
  if (group === "seion") return true;
  return settings[groupFlags[group]] === true;
}

export function enabledGroups(settings: RunSettings): Group[] {
  const enabled: Group[] = ["seion"];
  for (const group of optionalGroups) {
    if (settings[groupFlags[group]] === true) enabled.push(group);
  }
  return enabled;
}

// The characters picked for one alphabet, switched on or not.
export function selectionFor(settings: RunSettings, script: Script): string[] {
  return settings.selections[script] ?? [];
}

export function withSelection(
  settings: RunSettings,
  script: Script,
  ids: string[]
): Selections {
  return { ...settings.selections, [script]: ids };
}

export function migrateSettings(stored: LegacySettings): RunSettings {
  const { includeDakuten, selection, selections, ...rest } = stored;
  const merged: RunSettings = {
    ...defaultSettings,
    ...rest,
    selections: { ...defaultSettings.selections }
  };

  const shared = selection ?? [];
  merged.selections = {
    hiragana: selections?.hiragana ?? shared,
    katakana: selections?.katakana ?? shared
  };

  if (includeDakuten === true) {
    merged.includeDakuon = true;
    merged.includeHandakuon = true;
  }
  return merged;
}

export function sidesFor(format: Format, direction: Direction, roll: number): {
  prompt: Side;
  answer: Side;
} {
  const resolved: Direction =
    direction === "mixed" ? (roll < 0.5 ? "kana-romaji" : "romaji-kana") : direction;

  if (format === "audio-text") {
    return { prompt: "audio", answer: resolved === "kana-romaji" ? "romaji" : "kana" };
  }
  if (format === "text-audio") {
    return { prompt: resolved === "kana-romaji" ? "kana" : "romaji", answer: "audio" };
  }
  return resolved === "kana-romaji"
    ? { prompt: "kana", answer: "romaji" }
    : { prompt: "romaji", answer: "kana" };
}

export function usesAudio(format: Format): boolean {
  return format !== "text-text";
}

export function normalizeSettings(settings: RunSettings): {
  settings: RunSettings;
  notes: string[];
} {
  const notes: string[] = [];
  const next: RunSettings = { ...settings };

  if (next.scripts.length === 0) {
    next.scripts = ["hiragana"];
    notes.push("At least one alphabet is needed, hiragana was enabled.");
  }

  if (next.format === "text-audio" && next.answerStyle === "typing") {
    next.answerStyle = "choice";
    notes.push("Answering with audio always uses multiple choice.");
  }

  if (next.format === "audio-text" && next.direction !== "romaji-kana") {
    next.direction = "romaji-kana";
    notes.push("Audio to text has no direction setting, typing accepts kana or romaji.");
  }

  if (next.format === "text-audio" && next.direction !== "kana-romaji") {
    next.direction = "kana-romaji";
    notes.push("Text to audio always starts from the kana character.");
  }

  return { settings: next, notes };
}

export function clampCustomCount(value: number): number {
  if (!Number.isFinite(value)) return customCountMin;
  const stepped = Math.round(value / customCountStep) * customCountStep;
  return Math.min(customCountMax, Math.max(customCountMin, stepped));
}

// Whether a count is neither one pass nor one of the presets.
export function isCustomCount(count: number): boolean {
  return count > 0 && !questionCountOptions.includes(count);
}

export function formatLabel(format: Format): string {
  if (format === "audio-text") return "Audio to text";
  if (format === "text-audio") return "Text to audio";
  return "Text only";
}

export function answerStyleLabel(style: AnswerStyle): string {
  return style === "typing" ? "Typing" : "Multiple choice";
}

export function directionLabel(direction: Direction): string {
  if (direction === "romaji-kana") return "Romaji to kana";
  if (direction === "mixed") return "Mixed";
  return "Kana to romaji";
}

export function difficultyLabel(difficulty: Difficulty): string {
  if (difficulty === "advanced") return "Advanced";
  if (difficulty === "expert") return "Expert";
  return "Beginner";
}

// How many of the three wrong answers should be look alikes.
export function lookAlikeCount(difficulty: Difficulty): number {
  if (difficulty === "expert") return 3;
  if (difficulty === "advanced") return 1;
  return 0;
}

// A named character selection, saved from the picker.
export type Preset = {
  name: string;
  selections: Selections;
};

export function copySelections(selections: Partial<Selections>): Selections {
  return {
    hiragana: [...(selections.hiragana ?? [])],
    katakana: [...(selections.katakana ?? [])]
  };
}

// Adds a preset, or replaces the one already held under that name.
export function withPreset(presets: Preset[], preset: Preset): Preset[] {
  return [...presets.filter((item) => item.name !== preset.name), preset].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}
