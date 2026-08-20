import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { applySeed, seedPayload } from "../promo/seed";
import { answerChoice, answering, installShowcase, missed, Showcase, silence } from "./drive";

/**
 * The readme showcase. This is not a test: it walks the app through every
 * screen and leaves a numbered still of each one behind, at whichever size the
 * running project asks for. Run it through scripts/record-showcase.sh, which
 * sets up the environment and builds the gifs from what lands here.
 */

/** The moment the whole recording pretends to happen at. */
const CLOCK = Date.UTC(2026, 7, 19, 9, 30);

/** Seeds the generator the app draws its questions from. */
const SEED = 20260820;

/** Questions of the scored run that are answered wrong on purpose. */
const MISSED = new Set([3, 7]);

const root = fileURLToPath(new URL("../..", import.meta.url));

test("record the showcase", async ({ page }, testInfo) => {
  const shots = new Showcase(page, join(root, "docs", testInfo.project.name));

  await page.addInitScript(applySeed, seedPayload({ now: CLOCK, effects: false }));
  await page.addInitScript(installShowcase, { randomSeed: SEED, clockStart: CLOCK });
  await page.goto("/");

  const button = (name: string, exact = false) => page.getByRole("button", { name, exact });
  const startRun = button("Start run");

  /**
   * Walks out of a half finished run. Quitting would file it as a report and
   * put a one question run on the reports screen further down.
   */
  const backToSetup = async (): Promise<void> => {
    await button("Practice", true).click();
    await expect(startRun).toBeEnabled();
  };

  await expect(startRun).toBeEnabled();

  // the practice setup, once per question format
  await shots.top();
  await shots.shot("01_Setup_TextOnly");

  await button("Audio to text").click();
  await shots.top();
  await shots.shot("02_Setup_AudioText");

  await button("Text to audio").click();
  await shots.top();
  await shots.shot("03_Setup_TextAudio");

  // read the character, tap the reading
  await button("Text only").click();
  await button("Multiple choice").click();
  await button("Kana to romaji").click();
  await startRun.click();
  await answering(page);
  await shots.top();
  await shots.shot("04_Quiz_TextOnly_KanaRomaji");
  await backToSetup();

  // and the other way round, read the reading and tap the character
  await button("Romaji to kana").click();
  await startRun.click();
  await answering(page);
  await shots.top();
  await shots.shot("05_Quiz_TextOnly_RomajiKana");
  await backToSetup();

  // hear a character, type what it was
  await button("Audio to text").click();
  await button("Typing").click();
  await startRun.click();
  await silence(page);
  await shots.top();
  await shots.shot("06_Quiz_AudioText_Typing");

  // the same run getting one wrong, the first guess that happens to miss.
  // the answer goes in through the check button, enter also reaches the window
  // handler behind it and walks straight past the verdict
  const field = page.getByRole("textbox");
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await shots.advance(2100 + attempt * 180);
    await field.fill("ka");
    await button("Check").click();
    if (await missed(page)) break;
    await page.waitForTimeout(900);
  }
  await silence(page);
  await shots.top();
  await shots.shot("07_Quiz_AudioText_Incorrect");
  await backToSetup();

  // read the character, pick the sound that fits
  await button("Text to audio").click();
  await startRun.click();
  await expect(page.getByRole("button", { name: "Sound 1" })).toBeEnabled();
  await page.getByRole("button", { name: "Sound 2" }).click();
  await silence(page);
  await shots.top();
  await shots.shot("08_Quiz_TextAudio_Sounds");
  await backToSetup();

  // a run answered end to end, so the score screen has something to show
  await button("Text only").click();
  await button("Multiple choice").click();
  await button("Kana to romaji").click();
  await startRun.click();

  for (let question = 1; question <= 10; question += 1) {
    await shots.advance(1600 + question * 240);
    await answerChoice(page, !MISSED.has(question));
  }

  await expect(button("Run it again")).toBeVisible();
  await shots.top();
  await shots.shot("09_Result_Score");

  // one click turns the misses into the next practice set
  await button("Practice my mistakes").click();
  await expect(startRun).toBeEnabled();
  await shots.top();
  await shots.reveal(page.getByText(/Loaded \d+ characters/));
  await shots.shot("10_Setup_Mistakes");

  // every run is kept, charted and looked back on
  await button("Reports", true).click();
  await shots.top();
  await shots.shot("11_Reports_Overview");

  await button("Chart", true).click();
  await shots.top();
  await shots.shot("12_Chart_Characters");

  console.log(`  ${shots.count} stills in docs/${testInfo.project.name}`);
});
