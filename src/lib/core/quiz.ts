import { allKana, kanaById, type Kana, type Script } from "./kana";
import { groupEnabled, sidesFor, type RunSettings, type Side } from "./settings";

export type Choice = {
  kanaId: string;
  script: Script;
};

export type Question = {
  index: number;
  kanaId: string;
  script: Script;
  prompt: Side;
  answer: Side;
  choices: Choice[];
};

export type Answer = {
  kanaId: string;
  script: Script;
  correct: boolean;
  timedOut: boolean;
  elapsedMs: number;
  given: string;
};

const CHOICE_COUNT = 4;

export function eligibleKana(settings: RunSettings): Kana[] {
  const selected = new Set(settings.selection);
  return allKana.filter(
    (kana) => selected.has(kana.id) && groupEnabled(settings, kana.group)
  );
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickScript(scripts: Script[], rng: () => number): Script {
  return scripts[Math.floor(rng() * scripts.length)];
}

function buildChoices(
  target: Kana,
  script: Script,
  pool: Kana[],
  scripts: Script[],
  rng: () => number
): Choice[] {
  const used = new Set([target.romaji]);
  const choices: Choice[] = [{ kanaId: target.id, script }];
  const candidates = shuffle(
    pool.filter((kana) => kana.id !== target.id),
    rng
  );

  for (const kana of candidates) {
    if (choices.length >= CHOICE_COUNT) break;
    if (used.has(kana.romaji)) continue;
    used.add(kana.romaji);
    choices.push({ kanaId: kana.id, script: pickScript(scripts, rng) });
  }

  return shuffle(choices, rng);
}

export function buildQuestions(
  settings: RunSettings,
  rng: () => number = Math.random
): Question[] {
  const pool = eligibleKana(settings);
  if (pool.length === 0) return [];

  const distractorPool =
    pool.length >= CHOICE_COUNT
      ? pool
      : allKana.filter((kana) => groupEnabled(settings, kana.group));

  const total = settings.questionCount > 0 ? settings.questionCount : pool.length;
  const questions: Question[] = [];
  let bag: Kana[] = [];

  for (let index = 0; index < total; index += 1) {
    if (bag.length === 0) bag = shuffle(pool, rng);
    const target = bag.pop() as Kana;
    const script = pickScript(settings.scripts, rng);
    const sides = sidesFor(settings.format, settings.direction, rng());
    questions.push({
      index,
      kanaId: target.id,
      script,
      prompt: sides.prompt,
      answer: sides.answer,
      choices:
        settings.answerStyle === "choice"
          ? buildChoices(target, script, distractorPool, settings.scripts, rng)
          : []
    });
  }

  return questions;
}

export function checkChoice(question: Question, choice: Choice): boolean {
  return choice.kanaId === question.kanaId;
}

function matchesKana(kana: Kana, typed: string): boolean {
  const value = typed.trim();
  return value === kana.hira || value === kana.kata;
}

function matchesRomaji(kana: Kana, typed: string): boolean {
  const value = typed.trim().toLowerCase().replace(/\s+/g, "");
  return [kana.romaji, ...kana.alt].some((option) => option === value);
}

export function checkTyped(
  question: Question,
  typed: string,
  acceptEitherScript = false
): boolean {
  const kana = kanaById(question.kanaId);
  if (!kana) return false;
  if (acceptEitherScript) return matchesKana(kana, typed) || matchesRomaji(kana, typed);
  return question.answer === "kana" ? matchesKana(kana, typed) : matchesRomaji(kana, typed);
}
