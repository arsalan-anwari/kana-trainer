// Every visible string lives in src/lib/assets/local/<tag>/<namespace>.json.
// A key is "<namespace>.<path.through.the.file>", e.g. "setup.start".

type Dict = { [key: string]: string | Dict };

// ponytail: every locale is bundled eagerly. The app runs offline and the whole
// set is a few tens of KB; move to a lazy glob and an async setLocale if the
// string count ever makes that hurt.
const files = import.meta.glob<Dict>("./assets/local/*/*.json", {
  eager: true,
  import: "default"
});

const bundles: Record<string, Dict> = {};
for (const [path, data] of Object.entries(files)) {
  const parts = /\/local\/([^/]+)\/([^/]+)\.json$/.exec(path);
  if (parts === null) continue;
  (bundles[parts[1]] ??= {})[parts[2]] = data;
}

export const FALLBACK = "en";

// Tag plus the name shown in the picker, written in that language.
export const locales = [
  { tag: "en", name: "English" },
  { tag: "zh-CN", name: "简体中文" },
  { tag: "zh-TW", name: "繁體中文" },
  { tag: "ko", name: "한국어" },
  { tag: "es", name: "Español" },
  { tag: "pt-BR", name: "Português (BR)" },
  { tag: "id", name: "Bahasa Indonesia" },
  { tag: "vi", name: "Tiếng Việt" },
  { tag: "th", name: "ไทย" },
  { tag: "fr", name: "Français" },
  { tag: "de", name: "Deutsch" },
  { tag: "nl", name: "Nederlands" }
] as const;

export type LocaleTag = (typeof locales)[number]["tag"];

const tags = locales.map((locale) => locale.tag) as string[];

// "auto" and anything unknown resolve against the browser, then to English.
export function resolveLocale(wanted: string): string {
  if (tags.includes(wanted)) return wanted;
  const preferred = typeof navigator === "undefined" ? [] : [...navigator.languages];
  for (const candidate of preferred) {
    if (tags.includes(candidate)) return candidate;
    // en-GB counts as en, pt-PT as pt-BR: first tag sharing the base language
    const base = candidate.split("-")[0];
    const near = tags.find((tag) => tag.split("-")[0] === base);
    if (near !== undefined) return near;
  }
  return FALLBACK;
}

export const i18n = $state({ locale: FALLBACK });

export function setLocale(wanted: string): void {
  i18n.locale = resolveLocale(wanted);
  if (typeof document !== "undefined") document.documentElement.lang = i18n.locale;
}

function lookup(locale: string, key: string): string | null {
  let node: string | Dict | undefined = bundles[locale];
  for (const step of key.split(".")) {
    if (node === undefined || typeof node === "string") return null;
    node = node[step];
  }
  return typeof node === "string" ? node : null;
}

export type Params = Record<string, string | number>;

// Looks up a key in the current locale, falling back to English, then to the
// key itself so a missing string is obvious rather than blank. A numeric
// "count" picks the matching plural form, e.g. runs_one / runs_other.
export function t(key: string, params: Params = {}): string {
  const locale = i18n.locale;
  const count = params.count;

  const keys: string[] = [];
  if (typeof count === "number") {
    keys.push(`${key}_${new Intl.PluralRules(locale).select(count)}`, `${key}_other`);
  }
  keys.push(key);

  let text: string | null = null;
  for (const candidate of keys) {
    text = lookup(locale, candidate) ?? lookup(FALLBACK, candidate);
    if (text !== null) break;
  }
  if (text === null) return key;

  return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole
  );
}

// A number written the way the current locale writes numbers.
export function n(value: number): string {
  return new Intl.NumberFormat(i18n.locale).format(value);
}
