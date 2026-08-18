export type Script = "hiragana" | "katakana";

export type Kana = {
  id: string;
  hira: string;
  kata: string;
  romaji: string;
  alt: string[];
  row: string;
  dakuten: boolean;
  audio: string | null;
};

export type Row = {
  id: string;
  label: string;
  dakuten: boolean;
  kana: Kana[];
};

type Entry = [string, string, string, string, string[]];

function makeRow(id: string, label: string, dakuten: boolean, entries: Entry[]): Row {
  return {
    id,
    label,
    dakuten,
    kana: entries.map(([kanaId, hira, kata, romaji, alt]) => ({
      id: kanaId,
      hira,
      kata,
      romaji,
      alt,
      row: id,
      dakuten,
      audio: dakuten ? null : romaji
    }))
  };
}

export const rows: Row[] = [
  makeRow("a", "A", false, [
    ["a", "あ", "ア", "a", []],
    ["i", "い", "イ", "i", []],
    ["u", "う", "ウ", "u", []],
    ["e", "え", "エ", "e", []],
    ["o", "お", "オ", "o", []]
  ]),
  makeRow("ka", "KA", false, [
    ["ka", "か", "カ", "ka", []],
    ["ki", "き", "キ", "ki", []],
    ["ku", "く", "ク", "ku", []],
    ["ke", "け", "ケ", "ke", []],
    ["ko", "こ", "コ", "ko", []]
  ]),
  makeRow("sa", "SA", false, [
    ["sa", "さ", "サ", "sa", []],
    ["shi", "し", "シ", "shi", ["si"]],
    ["su", "す", "ス", "su", []],
    ["se", "せ", "セ", "se", []],
    ["so", "そ", "ソ", "so", []]
  ]),
  makeRow("ta", "TA", false, [
    ["ta", "た", "タ", "ta", []],
    ["chi", "ち", "チ", "chi", ["ti"]],
    ["tsu", "つ", "ツ", "tsu", ["tu"]],
    ["te", "て", "テ", "te", []],
    ["to", "と", "ト", "to", []]
  ]),
  makeRow("na", "NA", false, [
    ["na", "な", "ナ", "na", []],
    ["ni", "に", "ニ", "ni", []],
    ["nu", "ぬ", "ヌ", "nu", []],
    ["ne", "ね", "ネ", "ne", []],
    ["no", "の", "ノ", "no", []]
  ]),
  makeRow("ha", "HA", false, [
    ["ha", "は", "ハ", "ha", []],
    ["hi", "ひ", "ヒ", "hi", []],
    ["fu", "ふ", "フ", "fu", ["hu"]],
    ["he", "へ", "ヘ", "he", []],
    ["ho", "ほ", "ホ", "ho", []]
  ]),
  makeRow("ma", "MA", false, [
    ["ma", "ま", "マ", "ma", []],
    ["mi", "み", "ミ", "mi", []],
    ["mu", "む", "ム", "mu", []],
    ["me", "め", "メ", "me", []],
    ["mo", "も", "モ", "mo", []]
  ]),
  makeRow("ya", "YA", false, [
    ["ya", "や", "ヤ", "ya", []],
    ["yu", "ゆ", "ユ", "yu", []],
    ["yo", "よ", "ヨ", "yo", []]
  ]),
  makeRow("ra", "RA", false, [
    ["ra", "ら", "ラ", "ra", []],
    ["ri", "り", "リ", "ri", []],
    ["ru", "る", "ル", "ru", []],
    ["re", "れ", "レ", "re", []],
    ["ro", "ろ", "ロ", "ro", []]
  ]),
  makeRow("wa", "WA", false, [
    ["wa", "わ", "ワ", "wa", []],
    ["wo", "を", "ヲ", "wo", []]
  ]),
  makeRow("n", "N", false, [["n", "ん", "ン", "n", ["nn"]]]),
  makeRow("ga", "GA", true, [
    ["ga", "が", "ガ", "ga", []],
    ["gi", "ぎ", "ギ", "gi", []],
    ["gu", "ぐ", "グ", "gu", []],
    ["ge", "げ", "ゲ", "ge", []],
    ["go", "ご", "ゴ", "go", []]
  ]),
  makeRow("za", "ZA", true, [
    ["za", "ざ", "ザ", "za", []],
    ["ji", "じ", "ジ", "ji", ["zi"]],
    ["zu", "ず", "ズ", "zu", []],
    ["ze", "ぜ", "ゼ", "ze", []],
    ["zo", "ぞ", "ゾ", "zo", []]
  ]),
  makeRow("da", "DA", true, [
    ["da", "だ", "ダ", "da", []],
    ["di", "ぢ", "ヂ", "dji", ["di", "ji"]],
    ["du", "づ", "ヅ", "dzu", ["du", "zu"]],
    ["de", "で", "デ", "de", []],
    ["do", "ど", "ド", "do", []]
  ]),
  makeRow("ba", "BA", true, [
    ["ba", "ば", "バ", "ba", []],
    ["bi", "び", "ビ", "bi", []],
    ["bu", "ぶ", "ブ", "bu", []],
    ["be", "べ", "ベ", "be", []],
    ["bo", "ぼ", "ボ", "bo", []]
  ]),
  makeRow("pa", "PA", true, [
    ["pa", "ぱ", "パ", "pa", []],
    ["pi", "ぴ", "ピ", "pi", []],
    ["pu", "ぷ", "プ", "pu", []],
    ["pe", "ぺ", "ペ", "pe", []],
    ["po", "ぽ", "ポ", "po", []]
  ])
];

export const baseRows = rows.filter((row) => !row.dakuten);
export const dakutenRows = rows.filter((row) => row.dakuten);
export const allKana: Kana[] = rows.flatMap((row) => row.kana);

const byId = new Map(allKana.map((kana) => [kana.id, kana]));

export function kanaById(id: string): Kana | undefined {
  return byId.get(id);
}

export function rowById(id: string): Row | undefined {
  return rows.find((row) => row.id === id);
}

export function glyph(kana: Kana, script: Script): string {
  return script === "hiragana" ? kana.hira : kana.kata;
}

export function answersFor(kana: Kana): string[] {
  return [kana.romaji, ...kana.alt];
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function isRomajiMatch(kana: Kana, value: string): boolean {
  const typed = normalizeAnswer(value);
  return answersFor(kana).some((option) => option === typed);
}
