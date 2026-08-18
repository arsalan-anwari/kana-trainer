import type { Script } from "./kana";

export type Format = "text-text" | "audio-text" | "text-audio";
export type AnswerStyle = "choice" | "typing";
export type Direction = "kana-romaji" | "romaji-kana" | "mixed";
export type Side = "kana" | "romaji" | "audio";

export type RunSettings = {
  scripts: Script[];
  format: Format;
  answerStyle: AnswerStyle;
  direction: Direction;
  includeDakuten: boolean;
  selection: string[];
  questionCount: number;
  perQuestionSeconds: number;
  totalSeconds: number;
};

export const perQuestionOptions = [0, 5, 10, 15, 30];
export const totalTimeOptions = [0, 60, 120, 300, 600];
export const questionCountOptions = [10, 20, 30, 50];

export const defaultSettings: RunSettings = {
  scripts: ["hiragana"],
  format: "text-text",
  answerStyle: "choice",
  direction: "kana-romaji",
  includeDakuten: false,
  selection: [],
  questionCount: 20,
  perQuestionSeconds: 0,
  totalSeconds: 0
};

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

  if (usesAudio(next.format) && next.includeDakuten) {
    next.includeDakuten = false;
    notes.push("Dakuten characters have no audio, so they are left out of audio modes.");
  }

  return { settings: next, notes };
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
