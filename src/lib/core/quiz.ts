import { allKana, answersFor, kanaById, type Kana, type Script } from "./kana";
import { similarity } from "./similarity";
import {
  difficultyMinPool,
  groupEnabled,
  lookAlikeCount,
  selectionFor,
  sidesFor,
  type Difficulty,
  type RunSettings,
  type Side
} from "./settings";

export type Choice = {
  kanaId: string;
  script: Script;
};

/** One character in one alphabet: what a question is actually drawn from. */
export type Candidate = {
  kana: Kana;
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

/**
 * Characters that are read the same however they are written, so a sound the
 * player picks is never marked wrong for being the other spelling of it.
 */
const sameSound: Record<string, string> = { dji: "ji", dzu: "zu", wo: "o" };

/** Every character in play, in the alphabet it was picked in. */
export function eligiblePairs(settings: RunSettings): Candidate[] {
  const pairs: Candidate[] = [];
  for (const script of settings.scripts) {
    const selected = new Set(selectionFor(settings, script));
    for (const kana of allKana) {
      if (!selected.has(kana.id)) continue;
      if (!groupEnabled(settings, kana.group)) continue;
      pairs.push({ kana, script });
    }
  }
  return pairs;
}

/** The distinct characters in play, counting a character picked in both once. */
export function eligibleKana(settings: RunSettings): Kana[] {
  const seen = new Set<string>();
  const pool: Kana[] = [];
  for (const pair of eligiblePairs(settings)) {
    if (seen.has(pair.kana.id)) continue;
    seen.add(pair.kana.id);
    pool.push(pair.kana);
  }
  return pool;
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Everything one option puts in front of the player. Two options that share any
 * of these read as the same answer, so only one of them may be offered: ぢ next
 * to じ is a question with two right answers and no way to tell them apart.
 */
function surfaces(kana: Kana, script: Script, answer: Side): string[] {
  if (answer === "audio") return [sameSound[kana.romaji] ?? kana.romaji];
  if (answer === "romaji") return answersFor(kana);
  // a character is one character in either alphabet, so か rules out カ as well
  return [kana.hira, kana.kata];
}

function buildChoices(
  target: Candidate,
  pool: Candidate[],
  reserve: Candidate[],
  answer: Side,
  difficulty: Difficulty,
  rng: () => number
): Choice[] {
  const taken = new Set(surfaces(target.kana, target.script, answer));
  const choices: Choice[] = [{ kanaId: target.kana.id, script: target.script }];

  const candidates = shuffle(
    pool.filter((candidate) => candidate.kana.id !== target.kana.id),
    rng
  );

  const wanted = lookAlikeCount(difficulty);
  // the shuffle above already broke ties, and sorting is stable, so equally
  // confusable characters still take turns from one question to the next
  const lookAlike =
    wanted === 0
      ? []
      : candidates
          .map((candidate) => ({
            candidate,
            score: similarity(
              target.kana,
              target.script,
              candidate.kana,
              candidate.script,
              answer
            )
          }))
          .filter((entry) => entry.score > 0)
          .sort((left, right) => right.score - left.score)
          .slice(0, wanted)
          .map((entry) => entry.candidate);

  // the reserve only gets a look in when the selected characters cannot fill
  // four distinguishable options on their own, which a set of じ ぢ ず づ does
  const spare = shuffle(
    reserve.filter((candidate) => candidate.kana.id !== target.kana.id),
    rng
  );

  for (const candidate of [...lookAlike, ...candidates, ...spare]) {
    if (choices.length >= CHOICE_COUNT) break;
    const shown = surfaces(candidate.kana, candidate.script, answer);
    if (shown.some((value) => taken.has(value))) continue;
    for (const value of shown) taken.add(value);
    choices.push({ kanaId: candidate.kana.id, script: candidate.script });
  }

  return shuffle(choices, rng);
}

export function buildQuestions(
  settings: RunSettings,
  rng: () => number = Math.random
): Question[] {
  const pool = eligiblePairs(settings);
  if (pool.length === 0) return [];

  const everything: Candidate[] = settings.scripts.flatMap((script) =>
    allKana
      .filter((kana) => groupEnabled(settings, kana.group))
      .map((kana) => ({ kana, script }))
  );
  const distractors = pool.length >= CHOICE_COUNT ? pool : everything;

  // too small a set has no look alikes to draw on, so the difficulty is dropped
  const difficulty: Difficulty =
    pool.length >= difficultyMinPool ? settings.difficulty : "beginner";

  const total = settings.questionCount > 0 ? settings.questionCount : pool.length;
  const questions: Question[] = [];
  let bag: Candidate[] = [];

  for (let index = 0; index < total; index += 1) {
    if (bag.length === 0) bag = shuffle(pool, rng);
    const target = bag.pop() as Candidate;
    const sides = sidesFor(settings.format, settings.direction, rng());
    questions.push({
      index,
      kanaId: target.kana.id,
      script: target.script,
      prompt: sides.prompt,
      answer: sides.answer,
      choices:
        settings.answerStyle === "choice"
          ? buildChoices(target, distractors, everything, sides.answer, difficulty, rng)
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
