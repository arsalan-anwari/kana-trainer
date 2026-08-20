import { expect, type Locator, type Page } from "@playwright/test";
import { allKana } from "../../src/lib/core/kana";

/**
 * The machinery behind the showcase stills: a page pinned to one clock and one
 * random sequence, and the small vocabulary the scene script drives it with.
 */

export type ShowcaseInit = {
  /** Seed of the generator that stands in for Math.random. */
  randomSeed: number;
  /** Epoch the held clock starts at. */
  clockStart: number;
};

declare global {
  interface Window {
    __showcase: { advance: (ms: number) => void };
  }
}

/**
 * Runs in the page before the app boots. Nothing in here may vary between
 * recordings: a still that shifts by a pixel or a second is a diff in the repo
 * every time somebody runs the script.
 */
export function installShowcase(init: ShowcaseInit): void {
  // the same question order, the same distractors and the same slots, always
  let state = init.randomSeed;
  Math.random = (): number => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // a clock that only moves when the scene script moves it, so answer times and
  // run durations read like a real session without being one
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

  // no motion, so no frame is ever caught halfway through an animation
  const css = `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      caret-color: transparent !important;
    }
    html { scroll-behavior: auto !important; }
  `;

  const paint = (): void => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
}

/** The node side remote control. */
export class Showcase {
  private taken = 0;

  constructor(
    private readonly page: Page,
    private readonly dir: string
  ) {}

  /** Moves the held clock forward, in milliseconds of pretend thinking time. */
  async advance(ms: number): Promise<void> {
    await this.page.evaluate((value) => window.__showcase.advance(value), ms);
  }

  async top(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

/**
   * Brings an element into view when it sits off screen, and leaves the page
   * where it is when it does not. A phone needs the scroll that a desktop
   * window would only use to push the header out of frame.
   */
  async reveal(target: Locator, offset = 20): Promise<void> {
    await target.first().evaluate((element, gap) => {
      const box = element.getBoundingClientRect();
      if (box.top >= 0 && box.bottom <= window.innerHeight) return;
      window.scrollTo(0, Math.max(0, window.scrollY + box.top - gap));
    }, offset);
  }

  /**
   * Waits for the page to stop changing. Sound waveforms are decoded in the
   * background and screens are loaded on demand, so a fixed pause is either too
   * short or wasted time.
   */
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
    await this.page.screenshot({
      path: `${this.dir}/${name}.png`,
      animations: "disabled",
      caret: "hide"
    });
    this.taken += 1;
    console.log(`  ${name}.png`);
  }

  get count(): number {
    return this.taken;
  }
}

/**
 * Waits for the shared audio element to fall quiet. A clip that is still
 * playing keeps its corner of the page on its own compositing layer, and the
 * edges rasterised there land a pixel off from one recording to the next.
 */
export async function silence(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const element = document.querySelector<HTMLAudioElement>("audio[data-kana-audio]");
    return element === null || element.paused || element.ended;
  });
}

/** The character behind a glyph or a romaji reading shown on screen. */
export function resolve(text: string) {
  const value = text.trim();
  const found = allKana.find(
    (kana) => kana.hira === value || kana.kata === value || kana.romaji === value
  );
  if (found === undefined) throw new Error(`no kana matches ${JSON.stringify(value)}`);
  return found;
}

/** What the prompt frame is showing, empty for an audio prompt. */
export async function promptText(page: Page): Promise<string> {
  return (await page.locator("main .border-wire").first().innerText()).trim();
}

export const tiles = (page: Page): Locator => page.locator("main button.aspect-square");

/** The label under the slot number of each multiple choice tile. */
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

/** Waits until the question on screen is the one being answered. */
export async function answering(page: Page): Promise<void> {
  await expect(tiles(page).first()).toBeEnabled();
}

/**
 * Answers the multiple choice question on screen, right or wrong on purpose,
 * and leaves the run on the next question.
 */
export async function answerChoice(page: Page, correct: boolean): Promise<void> {
  await answering(page);
  const labels = await tileLabels(page);
  const right = slotOf(labels, await promptText(page));
  const index = correct ? right : labels.findIndex((_, slot) => slot !== right);
  await tiles(page).nth(index).click();

  // a right answer walks on by itself, a wrong one waits to be read
  if (correct) await page.waitForTimeout(850);
  else await page.getByRole("button", { name: "Continue" }).click();
}

/**
 * Whether the answer just given was the wrong one. A right answer clears itself
 * after a moment, so the verdict is polled rather than waited for.
 */
export async function missed(page: Page): Promise<boolean> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes("Not quite")) return true;
    if (text.includes("Correct")) return false;
    await page.waitForTimeout(25);
  }
  throw new Error("the answer was never given a verdict");
}
