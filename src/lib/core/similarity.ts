// Scores how easily two characters are mistaken for each other.

import { glyph, type Kana, type Script } from "./kana";
import type { Side } from "./settings";

// Groups of characters learners routinely mix up, by alphabet.
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

// Strips the voiced and half voiced marks off a character.
function stripMarks(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u3099\u309a]/g, "")
    .normalize("NFC");
}

// The consonant part of a reading, everything before the final vowel.
function onset(romaji: string): string {
  return romaji.slice(0, -1);
}

function coda(romaji: string): string {
  return romaji.slice(-1);
}

// Whether two readings are at most one character apart.
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

// Confusability score, higher is easier to confuse and zero is plainly distinct.
export function similarity(
  target: Kana,
  targetScript: Script,
  other: Kana,
  otherScript: Script,
  answer: Side
): number {
  if (target.id === other.id) return 0;

  if (answer === "kana") {
    // kana answers are compared by shape
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

  // romaji and audio answers are compared by reading, ignoring the alphabet.
  // Tokushon has no hiragana, so it is compared through its katakana instead.
  const shown = stripMarks(target.hira || target.kata);
  const rival = stripMarks(other.hira || other.kata);

  if (shown === rival) return 5;
  if (nearReadings(target.romaji, other.romaji)) return 4;
  if (shown[0] === rival[0]) return 3;
  if (target.row === other.row) return 2;
  if (onset(target.romaji) === onset(other.romaji) && target.romaji.length > 1) return 2;
  if (coda(target.romaji) === coda(other.romaji)) return 1;
  return 0;
}
