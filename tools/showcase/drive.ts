import { expect, type Locator, type Page } from "@playwright/test";
import { allKana } from "../../src/lib/core/kana";

export type ShowcaseInit = {
  // seed for the stand in Math.random
  randomSeed: number;
  // epoch the held clock starts at
  clockStart: number;
};

declare global {
  interface Window {
    __showcase: { advance: (ms: number) => void };
  }
}

// Pins randomness, the clock and animations in the page before the app boots.
export function installShowcase(init: ShowcaseInit): void {
  let state = init.randomSeed;
  Math.random = (): number => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // clock that only moves when the scene script moves it
  let current = init.clockStart;
  const RealDate = Date;
  window.Date = new Proxy(RealDate, {
    construct: (target, args: unknown[]) =>
      args.length === 0
        ? new target(current)
        : new (target as unknown as new (...rest: unknown[]) => Date)(...args),
    get: (target, property) =>
      property === "now" ? () => current : Reflect.get(target, property)
  }) as DateConstructor;

  window.__showcase = {
    advance: (ms) => {
      current += ms;
    }
  };

  // stops all motion and pins the confetti to fixed frames
  const css = `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      caret-color: transparent !important;
    }
    html { scroll-behavior: auto !important; }

    .anim-confetti {
      animation-name: confetti-fall !important;
      animation-timing-function: linear !important;
      animation-fill-mode: both !important;
      animation-iteration-count: 1 !important;
      animation-delay: -1s !important;
      animation-play-state: paused !important;
      animation-duration: 3s !important;
    }
    .anim-confetti:nth-child(4n + 1) { animation-duration: 1.4s !important; }
    .anim-confetti:nth-child(4n + 2) { animation-duration: 4.6s !important; }
    .anim-confetti:nth-child(4n + 3) { animation-duration: 2s !important; }
  `;

  const paint = (): void => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
}

// Node side remote control for the page.
export class Showcase {
  private taken = 0;

  constructor(
    private readonly page: Page,
    private readonly dir: string
  ) {}

  // moves the held clock forward by the given milliseconds
  async advance(ms: number): Promise<void> {
    await this.page.evaluate((value) => window.__showcase.advance(value), ms);
  }

  async top(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  // scrolls an element into view only when it sits off screen
  async reveal(target: Locator, offset = 20): Promise<void> {
    await target.first().evaluate((element, gap) => {
      const box = element.getBoundingClientRect();
      if (box.top >= 0 && box.bottom <= window.innerHeight) return;
      window.scrollTo(0, Math.max(0, window.scrollY + box.top - gap));
    }, offset);
  }

  // waits for the page markup to stop changing
  async settle(): Promise<void> {
    await this.page.waitForLoadState("networkidle").catch(() => undefined);
    let previous = "";
    for (let attempt = 0; attempt < 25; attempt += 1) {
      const current = await this.page.evaluate(() => document.body.innerHTML);
      if (current === previous) return;
      previous = current;
      await this.page.waitForTimeout(150);
    }
  }

  async shot(name: string): Promise<void> {
    await this.settle();
    await this.snap(name);
  }

  // takes a screenshot without settling first
  async snap(name: string, animations: "disabled" | "allow" = "disabled"): Promise<void> {
    await this.page.screenshot({
      path: `${this.dir}/${name}.png`,
      animations,
      caret: "hide"
    });
    this.taken += 1;
    console.log(`  ${name}.png`);
  }

  get count(): number {
    return this.taken;
  }
}

// Waits for the shared audio element to stop playing.
export async function silence(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const element = document.querySelector<HTMLAudioElement>("audio[data-kana-audio]");
    return element === null || element.paused || element.ended;
  });
}

// Looks up the kana behind a glyph or romaji reading.
export function resolve(text: string) {
  const value = text.trim();
  const found = allKana.find(
    (kana) => kana.hira === value || kana.kata === value || kana.romaji === value
  );
  if (found === undefined) throw new Error(`no kana matches ${JSON.stringify(value)}`);
  return found;
}

// Reads the prompt frame text, empty for an audio prompt.
export async function promptText(page: Page): Promise<string> {
  return (await page.locator("main .border-wire").first().innerText()).trim();
}

export const tiles = (page: Page): Locator => page.locator("main button.aspect-square");

// Reads the label under the slot number of each choice tile.
async function tileLabels(page: Page): Promise<string[]> {
  const texts = await tiles(page).allInnerTexts();
  return texts.map((text) => text.trim().split("\n").filter(Boolean).pop()?.trim() ?? "");
}

function slotOf(labels: string[], reading: string): number {
  const target = resolve(reading);
  return labels.findIndex(
    (label) => label === target.romaji || label === target.hira || label === target.kata
  );
}

// Waits until the choice tiles accept input.
export async function answering(page: Page): Promise<void> {
  await expect(tiles(page).first()).toBeEnabled();
}

// Answers the multiple choice question, right or wrong, and moves on.
export async function answerChoice(page: Page, correct: boolean, wait = true): Promise<void> {
  await answering(page);
  const labels = await tileLabels(page);
  const right = slotOf(labels, await promptText(page));
  const index = correct ? right : labels.findIndex((_, slot) => slot !== right);
  await tiles(page).nth(index).click();

  // a wrong answer holds until Continue is pressed
  if (!correct) await page.getByRole("button", { name: "Continue" }).click();
  else if (wait) await page.waitForTimeout(850);
}

// Confirms the stop dialog and discards the run.
export async function discardRun(page: Page): Promise<void> {
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Stop and discard" }).click();
  await expect(page.getByRole("alertdialog")).toBeHidden();
}

// Opens a collapsible row by its label, if one is present.
export async function openRow(page: Page, label: string): Promise<void> {
  const chevron = page.getByRole("button", { name: `Show ${label}`, exact: true });
  if (await chevron.count()) await chevron.first().click();
}

// Locates the splash over a finished run.
export function splash(page: Page): Locator {
  return page.getByText("Tap anywhere to skip");
}

// Polls the verdict of the last answer and reports whether it was wrong.
export async function missed(page: Page): Promise<boolean> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes("Not quite")) return true;
    if (text.includes("Correct")) return false;
    await page.waitForTimeout(25);
  }
  throw new Error("the answer was never given a verdict");
}
