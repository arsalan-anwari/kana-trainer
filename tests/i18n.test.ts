import { describe, expect, it } from "vitest";
import { locales, resolveLocale, setLocale, t } from "../src/lib/i18n.svelte";

describe("resolveLocale", () => {
  it("keeps a tag it knows", () => {
    expect(resolveLocale("pt-BR")).toBe("pt-BR");
  });

  it("falls back to English for anything unknown", () => {
    expect(resolveLocale("auto")).toBe("en");
    expect(resolveLocale("kl")).toBe("en");
  });
});

describe("t", () => {
  it("reads the current locale, and the key itself when nothing has it", () => {
    setLocale("nl");
    expect(t("common.nav.setup")).toBe("Oefenen");
    expect(t("common.nope")).toBe("common.nope");
    setLocale("en");
    expect(t("common.nav.setup")).toBe("Practice");
  });

  it("fills placeholders and leaves unknown ones alone", () => {
    expect(t("chart.play", { romaji: "ka", kata: "カ" })).toBe("Play ka カ");
    expect(t("chart.play", { romaji: "ka" })).toBe("Play ka {kata}");
  });

  it("picks the plural form for a count", () => {
    expect(t("reports.runs", { count: 1 })).toBe("1 run");
    expect(t("reports.runs", { count: 3 })).toBe("3 runs");
  });

  it("falls back to English when a locale is missing a key", () => {
    setLocale("de");
    expect(t("common.appName")).toBe("Kana Trainer");
    setLocale("en");
  });
});

describe("locale files", () => {
  it("ships every language the picker offers", () => {
    for (const locale of locales) {
      setLocale(locale.tag);
      expect(t("setup.start.button")).not.toBe("setup.start.button");
    }
    setLocale("en");
  });
});
