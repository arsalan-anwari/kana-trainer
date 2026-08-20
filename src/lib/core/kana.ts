export type Script = "hiragana" | "katakana";

export type Group = "seion" | "dakuon" | "handakuon" | "yoon";

export type Kana = {
  id: string;
  hira: string;
  kata: string;
  romaji: string;
  alt: string[];
  row: string;
  group: Group;
  audio: string;
};

export type Row = {
  id: string;
  label: string;
  group: Group;
  kana: Kana[];
};

type Entry = [string, string, string, string, string[], string?];

function makeRow(id: string, label: string, group: Group, entries: Entry[]): Row {
  return {
    id,
    label,
    group,
    kana: entries.map(([kanaId, hira, kata, romaji, alt, clip]) => ({
      id: kanaId,
      hira,
      kata,
      romaji,
      alt,
      row: id,
      group,
      audio: `${group}/${clip ?? romaji}`
    }))
  };
}

export const rows: Row[] = [
  makeRow("a", "A", "seion", [
    ["a", "あ", "ア", "a", []],
    ["i", "い", "イ", "i", []],
    ["u", "う", "ウ", "u", []],
    ["e", "え", "エ", "e", []],
    ["o", "お", "オ", "o", []]
  ]),
  makeRow("ka", "KA", "seion", [
    ["ka", "か", "カ", "ka", []],
    ["ki", "き", "キ", "ki", []],
    ["ku", "く", "ク", "ku", []],
    ["ke", "け", "ケ", "ke", []],
    ["ko", "こ", "コ", "ko", []]
  ]),
  makeRow("sa", "SA", "seion", [
    ["sa", "さ", "サ", "sa", []],
    ["shi", "し", "シ", "shi", ["si"]],
    ["su", "す", "ス", "su", []],
    ["se", "せ", "セ", "se", []],
    ["so", "そ", "ソ", "so", []]
  ]),
  makeRow("ta", "TA", "seion", [
    ["ta", "た", "タ", "ta", []],
    ["chi", "ち", "チ", "chi", ["ti"]],
    ["tsu", "つ", "ツ", "tsu", ["tu"]],
    ["te", "て", "テ", "te", []],
    ["to", "と", "ト", "to", []]
  ]),
  makeRow("na", "NA", "seion", [
    ["na", "な", "ナ", "na", []],
    ["ni", "に", "ニ", "ni", []],
    ["nu", "ぬ", "ヌ", "nu", []],
    ["ne", "ね", "ネ", "ne", []],
    ["no", "の", "ノ", "no", []]
  ]),
  makeRow("ha", "HA", "seion", [
    ["ha", "は", "ハ", "ha", []],
    ["hi", "ひ", "ヒ", "hi", []],
    ["fu", "ふ", "フ", "fu", ["hu"]],
    ["he", "へ", "ヘ", "he", []],
    ["ho", "ほ", "ホ", "ho", []]
  ]),
  makeRow("ma", "MA", "seion", [
    ["ma", "ま", "マ", "ma", []],
    ["mi", "み", "ミ", "mi", []],
    ["mu", "む", "ム", "mu", []],
    ["me", "め", "メ", "me", []],
    ["mo", "も", "モ", "mo", []]
  ]),
  makeRow("ya", "YA", "seion", [
    ["ya", "や", "ヤ", "ya", []],
    ["yu", "ゆ", "ユ", "yu", []],
    ["yo", "よ", "ヨ", "yo", []]
  ]),
  makeRow("ra", "RA", "seion", [
    ["ra", "ら", "ラ", "ra", []],
    ["ri", "り", "リ", "ri", []],
    ["ru", "る", "ル", "ru", []],
    ["re", "れ", "レ", "re", []],
    ["ro", "ろ", "ロ", "ro", []]
  ]),
  makeRow("wa", "WA", "seion", [
    ["wa", "わ", "ワ", "wa", []],
    ["wo", "を", "ヲ", "wo", []]
  ]),
  makeRow("n", "N", "seion", [["n", "ん", "ン", "n", ["nn"]]]),
  makeRow("ga", "GA", "dakuon", [
    ["ga", "が", "ガ", "ga", []],
    ["gi", "ぎ", "ギ", "gi", []],
    ["gu", "ぐ", "グ", "gu", []],
    ["ge", "げ", "ゲ", "ge", []],
    ["go", "ご", "ゴ", "go", []]
  ]),
  makeRow("za", "ZA", "dakuon", [
    ["za", "ざ", "ザ", "za", []],
    ["ji", "じ", "ジ", "ji", ["zi"]],
    ["zu", "ず", "ズ", "zu", []],
    ["ze", "ぜ", "ゼ", "ze", []],
    ["zo", "ぞ", "ゾ", "zo", []]
  ]),
  makeRow("da", "DA", "dakuon", [
    ["da", "だ", "ダ", "da", []],
    ["di", "ぢ", "ヂ", "dji", ["di", "ji"], "di"],
    ["du", "づ", "ヅ", "dzu", ["du", "zu"], "du"],
    ["de", "で", "デ", "de", []],
    ["do", "ど", "ド", "do", []]
  ]),
  makeRow("ba", "BA", "dakuon", [
    ["ba", "ば", "バ", "ba", []],
    ["bi", "び", "ビ", "bi", []],
    ["bu", "ぶ", "ブ", "bu", []],
    ["be", "べ", "ベ", "be", []],
    ["bo", "ぼ", "ボ", "bo", []]
  ]),
  makeRow("pa", "PA", "handakuon", [
    ["pa", "ぱ", "パ", "pa", []],
    ["pi", "ぴ", "ピ", "pi", []],
    ["pu", "ぷ", "プ", "pu", []],
    ["pe", "ぺ", "ペ", "pe", []],
    ["po", "ぽ", "ポ", "po", []]
  ]),
  makeRow("kya", "KYA", "yoon", [
    ["kya", "きゃ", "キャ", "kya", []],
    ["kyu", "きゅ", "キュ", "kyu", []],
    ["kyo", "きょ", "キョ", "kyo", []]
  ]),
  makeRow("sha", "SHA", "yoon", [
    ["sha", "しゃ", "シャ", "sha", ["sya", "shya"], "sya"],
    ["shu", "しゅ", "シュ", "shu", ["syu", "shyu"], "syu"],
    ["sho", "しょ", "ショ", "sho", ["syo", "shyo"], "syo"]
  ]),
  makeRow("cha", "CHA", "yoon", [
    ["cha", "ちゃ", "チャ", "cha", ["tya", "cya"], "cya"],
    ["chu", "ちゅ", "チュ", "chu", ["tyu", "cyu"], "cyu"],
    ["cho", "ちょ", "チョ", "cho", ["tyo", "cyo"], "cyo"]
  ]),
  makeRow("nya", "NYA", "yoon", [
    ["nya", "にゃ", "ニャ", "nya", []],
    ["nyu", "にゅ", "ニュ", "nyu", []],
    ["nyo", "にょ", "ニョ", "nyo", []]
  ]),
  makeRow("hya", "HYA", "yoon", [
    ["hya", "ひゃ", "ヒャ", "hya", []],
    ["hyu", "ひゅ", "ヒュ", "hyu", []],
    ["hyo", "ひょ", "ヒョ", "hyo", []]
  ]),
  makeRow("mya", "MYA", "yoon", [
    ["mya", "みゃ", "ミャ", "mya", []],
    ["myu", "みゅ", "ミュ", "myu", []],
    ["myo", "みょ", "ミョ", "myo", []]
  ]),
  makeRow("rya", "RYA", "yoon", [
    ["rya", "りゃ", "リャ", "rya", []],
    ["ryu", "りゅ", "リュ", "ryu", []],
    ["ryo", "りょ", "リョ", "ryo", []]
  ]),
  makeRow("gya", "GYA", "yoon", [
    ["gya", "ぎゃ", "ギャ", "gya", []],
    ["gyu", "ぎゅ", "ギュ", "gyu", []],
    ["gyo", "ぎょ", "ギョ", "gyo", []]
  ]),
  makeRow("ja", "JA", "yoon", [
    ["ja", "じゃ", "ジャ", "ja", ["jya", "zya"], "zya"],
    ["ju", "じゅ", "ジュ", "ju", ["jyu", "zyu"], "zyu"],
    ["jo", "じょ", "ジョ", "jo", ["jyo", "zyo"], "zyo"]
  ]),
  makeRow("bya", "BYA", "yoon", [
    ["bya", "びゃ", "ビャ", "bya", []],
    ["byu", "びゅ", "ビュ", "byu", []],
    ["byo", "びょ", "ビョ", "byo", []]
  ]),
  makeRow("pya", "PYA", "yoon", [
    ["pya", "ぴゃ", "ピャ", "pya", []],
    ["pyu", "ぴゅ", "ピュ", "pyu", []],
    ["pyo", "ぴょ", "ピョ", "pyo", []]
  ])
];

export const groups: Group[] = ["seion", "dakuon", "handakuon", "yoon"];

export const seionRows = rows.filter((row) => row.group === "seion");
export const dakuonRows = rows.filter((row) => row.group === "dakuon");
export const handakuonRows = rows.filter((row) => row.group === "handakuon");
export const yoonRows = rows.filter((row) => row.group === "yoon");
export const allKana: Kana[] = rows.flatMap((row) => row.kana);

const byId = new Map(allKana.map((kana) => [kana.id, kana]));

export function kanaById(id: string): Kana | undefined {
  return byId.get(id);
}

export function rowById(id: string): Row | undefined {
  return rows.find((row) => row.id === id);
}

export function rowsInGroup(group: Group): Row[] {
  return rows.filter((row) => row.group === group);
}

export function groupLabel(group: Group): string {
  if (group === "dakuon") return "Dakuon";
  if (group === "handakuon") return "Handakuon";
  if (group === "yoon") return "Yoon";
  return "Seion";
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
