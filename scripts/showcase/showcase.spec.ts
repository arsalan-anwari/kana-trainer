import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { applySeed, seedPayload } from "../promo/seed";
import {
  answerChoice,
  answering,
  discardRun,
  installShowcase,
  missed,
  openRow,
  Showcase,
  silence,
  splash
} from "./drive";

/** The moment the whole recording pretends to happen at. */
const CLOCK = Date.UTC(2026, 7, 19, 20, 30);

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

  const button = (name: string | RegExp, exact = false) =>
    page.getByRole("button", { name, exact });
  const startRun = button("Start run");

  /**
   * Leaves a half finished run. Walking off the quiz screen is stopping the
   * run, so it asks first and the answers are thrown away.
   */
  const backToSetup = async (): Promise<void> => {
    await button("Practice", true).click();
    await discardRun(page);
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

  // both alphabets at once, each with a set of its own behind its tab
  await button("Text only").click();
  await button("Multiple choice").click();
  await button("Kana to romaji").click();
  await button("Katakana").click();
  await page.getByRole("tab", { name: "Katakana" }).click();
  await button(/^K-row/).click();
  await openRow(page, "K-row");
  await shots.top();
  await shots.reveal(page.getByText("Characters", { exact: true }), 44);
  await shots.shot("04_Setup_Alphabets");

  // how long the run is, how hard it pushes and what is in it
  await shots.reveal(page.getByText("Run options", { exact: true }), 44);
  await button("Advanced").click();
  await shots.shot("05_Setup_RunOptions");
  await shots.top();

  // read the character, tap the reading
  await startRun.click();
  await answering(page);
  await shots.top();
  await shots.shot("06_Quiz_TextOnly_KanaRomaji");
  await backToSetup();

  // and the other way round, read the reading and tap the character
  await button("Romaji to kana").click();
  await startRun.click();
  await answering(page);
  await shots.top();
  await shots.shot("07_Quiz_TextOnly_RomajiKana");
  await backToSetup();

  // hear a character, type what it was
  await button("Audio to text").click();
  await button("Typing").click();
  await startRun.click();
  await silence(page);
  await shots.top();
  await shots.shot("08_Quiz_AudioText_Typing");

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
  await shots.shot("09_Quiz_AudioText_Incorrect");
  await backToSetup();

  // read the character, pick the sound that fits
  await button("Text to audio").click();
  await startRun.click();
  await expect(page.getByRole("button", { name: "Sound 1" })).toBeEnabled();
  await page.getByRole("button", { name: "Sound 2" }).click();
  await silence(page);
  await shots.top();
  await shots.shot("10_Quiz_TextAudio_Sounds");

  // stopping a run asks first, and says what it costs
  await shots.advance(2400);
  await button("Check").click();
  await button("Quit", true).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await shots.shot("11_Quiz_QuitConfirm");
  await discardRun(page);
  await expect(startRun).toBeEnabled();

  // a run answered end to end, so the score screen has something to show
  await button("Text only").click();
  await button("Multiple choice").click();
  await button("Kana to romaji").click();
  await startRun.click();

  for (let question = 1; question <= 10; question += 1) {
    await shots.advance(1600 + question * 240);
    await answerChoice(page, !MISSED.has(question), question < 10);
  }

  // the grade lands over the report and then clears itself, so it is caught on
  // the way past rather than settled for
  await expect(splash(page)).toBeVisible();
  await shots.snap("12_Result_Splash", "allow");
  await expect(splash(page)).toBeHidden();

  await expect(button("Run it again")).toBeVisible();
  await shots.top();
  await shots.shot("13_Result_Score");

  // one click turns the misses into the next practice set
  await button("Practice my mistakes").click();
  await expect(startRun).toBeEnabled();
  await shots.top();
  await shots.reveal(page.getByText(/Loaded \d+ characters/));
  await shots.shot("14_Setup_Mistakes");

  // every run is kept, charted and looked back on, a window at a time
  await button("Reports", true).click();
  await button("Last week", true).click();
  await shots.top();
  await shots.shot("15_Reports_LastWeek");

  await shots.reveal(page.getByText("Mistakes by group"));
  await shots.shot("16_Reports_Mistakes");
  await shots.top();

  // a history that leaves the machine: the ticked runs are written to one
  // .kt-report file, removed, and read back in from that same file
  const runs = page.getByRole("button", { name: /\d+\/\d+ correct/ });
  await runs.nth(0).click();
  await runs.nth(1).click();

  const saved = page.waitForEvent("download");
  await button(/^Export/).click();
  const file = await (await saved).path();
  await shots.top();
  await shots.shot("17_Reports_Export");

  // removing asks first, and it asks about the whole selection at once
  await button(/^Remove \d+ selected/).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await shots.shot("18_Reports_RemoveConfirm");
  await button("Remove 2 runs", true).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);

  // and the file puts them back, on this machine or on another one
  const picker = page.waitForEvent("filechooser");
  await button(/^Import runs/).click();
  await (await picker).setFiles(file);
  await expect(page.getByText("Imported 2 runs.")).toBeVisible();
  // a desktop window has the message in frame already, a phone has to scroll to
  // it, and the gap leaves the run count above it in the shot
  await shots.reveal(page.getByText("Imported 2 runs."), 210);
  await shots.shot("19_Reports_Imported");
  await shots.top();

  await button("Chart", true).click();
  await expect(page.getByRole("heading", { name: /Seion/ })).toBeVisible();
  await openRow(page, "A-row");
  await openRow(page, "K-row");
  await shots.top();
  await shots.shot("20_Chart_Characters");

  // the settings that outlive a run. a phone keeps them in a sheet of their
  // own, a wide window has room for them in the header
  const sheet = button("Settings", true);
  if (await sheet.isVisible()) {
    await sheet.click();
    await shots.shot("21_Settings_Menu");
    await button("Close settings", true).click();
  } else {
    await button("High contrast theme", true).click();
    await shots.shot("21_Chart_HighContrast");
    await button("High contrast theme", true).click();
  }

  console.log(`  ${shots.count} stills in docs/${testInfo.project.name}`);
});
