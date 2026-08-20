/**
 * How easily two characters are mistaken for each other, used to make the wrong
 * answers harder as the difficulty goes up.
 */

import { glyph, type Kana, type Script } from "./kana";
import type { Side } from "./settings";

/** Groups of characters learners routinely mix up, by alphabet. */
const lookAlikes: Record<Script, string[][]> = {
  hiragana: [
    ["a", "o", "me", "nu"],
    ["i", "ri"],
    ["u", "tsu", "ra"],
    ["ki", "sa", "chi"],
    ["ke", "ha", "ho", "ma"],
    ["su", "mu", "nu"],
    ["so", "ro", "ru"],
    ["ta", "na"],
    ["ne", "re", "wa", "wo"],
    ["shi", "tsu", "mo"],
    ["ku", "he"],
    ["ni", "ko"],
    ["e", "chi"]
  ],
  katakana: [
    ["shi", "tsu", "so", "n"],
    ["ku", "ta", "ke"],
    ["a", "ma", "mu"],
    ["i", "ri", "to"],
    ["u", "wa", "ra", "fu"],
    ["o", "ho"],
    ["ki", "sa", "ne"],
    ["ko", "yu", "ni", "mi"],
    ["su", "nu", "me", "ma"],
    ["se", "hi"],
    ["chi", "te"],
    ["na", "me", "ta"],
    ["ha", "he"],
    ["mo", "yo"],
    ["ru", "re", "ro"],
    ["ya", "se", "ka"],
    ["wo", "ra"],
    ["no", "so", "n", "me"]
  ]
};

function pairsOf(script: Script): Set<string> {
  const set = new Set<string>();
  for (const cluster of lookAlikes[script]) {
    for (const left of cluster) {
      for (const right of cluster) {
        if (left !== right) set.add(`${left}|${right}`);
      }
    }
  }
  return set;
}

const confusable: Record<Script, Set<string>> = {
  hiragana: pairsOf("hiragana"),
  katakana: pairsOf("katakana")
};

/** The character with its voiced or half voiced mark taken off. */
function stripMarks(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u3099\u309a]/g, "")
    .normalize("NFC");
}

/** The consonant part of a reading: everything before the final vowel. */
function onset(romaji: string): string {
  return romaji.slice(0, -1);
}

function coda(romaji: string): string {
  return romaji.slice(-1);
}

/** Whether two readings are one character apart, so they read almost the same. */
function nearReadings(left: string, right: string): boolean {
  if (Math.abs(left.length - right.length) > 1) return false;
  const [short, long] = left.length <= right.length ? [left, right] : [right, left];
  let index = 0;
  let skipped = false;
  for (let cursor = 0; cursor < long.length; cursor += 1) {
    if (short[index] === long[cursor]) {
      index += 1;
      continue;
    }
    if (skipped) return false;
    skipped = true;
    if (short.length === long.length) index += 1;
  }
  return true;
}

/**
 * Higher means easier to confuse. Zero means the two are plainly different.
 *
 * Which side the player answers on decides what "similar" means: a kana answer
 * is confused by shape, a romaji or audio answer by sound.
 */
export function similarity(
  target: Kana,
  targetScript: Script,
  other: Kana,
  otherScript: Script,
  answer: Side
): number {
  if (target.id === other.id) return 0;

  if (answer === "kana") {
    // shape only: が against か, or びゃ against ひゃ, is one mark and nothing else
    const shown = stripMarks(glyph(target, targetScript));
    const rival = stripMarks(glyph(other, otherScript));
    const sameAlphabet = targetScript === otherScript;

    if (sameAlphabet && shown === rival) return 5;
    if (sameAlphabet && shown[0] === rival[0]) return 4;
    if (sameAlphabet && confusable[targetScript].has(`${target.id}|${other.id}`)) return 3;
    if (target.row === other.row) return 2;
    if (coda(target.romaji) === coda(other.romaji)) return 1;
    return 0;
  }

  // romaji and audio answers, where only the reading is on show and the
  // alphabet a character happens to be drawn in makes no difference
  const shown = stripMarks(target.hira);
  const rival = stripMarks(other.hira);

  if (shown === rival) return 5;
  if (nearReadings(target.romaji, other.romaji)) return 4;
  if (shown[0] === rival[0]) return 3;
  if (target.row === other.row) return 2;
  if (onset(target.romaji) === onset(other.romaji) && target.romaji.length > 1) return 2;
  if (coda(target.romaji) === coda(other.romaji)) return 1;
  return 0;
}
