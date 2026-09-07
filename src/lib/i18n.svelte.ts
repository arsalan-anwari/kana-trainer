// Every visible string lives in src/lib/assets/local/<tag>/<namespace>.json.
// A key is "<namespace>.<path.through.the.file>", e.g. "setup.start".

import { bundlesFromGlob, registerLocales, type Dict } from "kaizen-ui";

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

// ponytail: every locale is bundled eagerly. The app runs offline and the whole
// set is a few tens of KB; move to a lazy glob and an async setLocale if the
// string count ever makes that hurt.
registerLocales({
  bundles: bundlesFromGlob(
    import.meta.glob<Dict>("./assets/local/*/*.json", { eager: true, import: "default" })
  ),
  locales: [...locales],
  fallback: FALLBACK
});

export { i18n, n, resolveLocale, setLocale, t, type Params } from "kaizen-ui";
