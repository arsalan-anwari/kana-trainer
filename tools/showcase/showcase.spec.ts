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

// Timestamp the whole recording runs at.
const CLOCK = Date.UTC(2026, 7, 19, 20, 30);

// Seed for the question generator.
const SEED = 20260820;

// Questions of the scored run answered wrong on purpose.
const MISSED = new Set([3, 7]);

const root = fileURLToPath(new URL("../..", import.meta.url));

test("record the showcase", async ({ page }, testInfo) => {
  const shots = new Showcase(page, join(root, "packaging/repo", testInfo.project.name));

  await page.addInitScript(applySeed, seedPayload({ now: CLOCK, effects: false }));
  await page.addInitScript(installShowcase, { randomSeed: SEED, clockStart: CLOCK });
  await page.goto("/");

  const button = (name: string | RegExp, exact = false) =>
    page.getByRole("button", { name, exact });
  const startRun = button("Start run");

  // leaves a half finished run and returns to the setup screen. The header
  // tabs are hidden during a run, so this goes out through Quit.
  const backToSetup = async (): Promise<void> => {
    await button("Quit", true).click();
    await discardRun(page);
    await expect(startRun).toBeEnabled();
  };

  await expect(startRun).toBeEnabled();

  // practice setup, once per question format
  await shots.top();
  await shots.shot("01_Setup_TextOnly");

  await button("Audio to text").click();
  await shots.top();
  await shots.shot("02_Setup_AudioText");

  await button("Text to audio").click();
  await shots.top();
  await shots.shot("03_Setup_TextAudio");

  // both alphabets on, each with its own character set
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

  // run length, difficulty and extra sets
  await shots.reveal(page.getByText("Run options", { exact: true }), 44);
  await button("Advanced").click();
  await shots.shot("05_Setup_RunOptions");
  await shots.top();

  // kana to romaji, multiple choice
  await startRun.click();
  await answering(page);
  await shots.top();
  await shots.shot("06_Quiz_TextOnly_KanaRomaji");
  await backToSetup();

  // romaji to kana, multiple choice
  await button("Romaji to kana").click();
  await startRun.click();
  await answering(page);
  await shots.top();
  await shots.shot("07_Quiz_TextOnly_RomajiKana");
  await backToSetup();

  // audio to text, typed answer
  await button("Audio to text").click();
  await button("Typing").click();
  await startRun.click();
  await silence(page);
  await shots.top();
  await shots.shot("08_Quiz_AudioText_Typing");

  // same run, retried until an answer misses, submitted through the check button
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

  // text to audio, pick the matching sound
  await button("Text to audio").click();
  await startRun.click();
  await expect(page.getByRole("button", { name: "Sound 1" })).toBeEnabled();
  await page.getByRole("button", { name: "Sound 2" }).click();
  await silence(page);
  await shots.top();
  await shots.shot("10_Quiz_TextAudio_Sounds");

  // quit confirmation dialog
  await shots.advance(2400);
  await button("Check").click();
  await button("Quit", true).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await shots.shot("11_Quiz_QuitConfirm");
  await discardRun(page);
  await expect(startRun).toBeEnabled();

  // a full run answered end to end
  await button("Text only").click();
  await button("Multiple choice").click();
  await button("Kana to romaji").click();
  await startRun.click();

  for (let question = 1; question <= 10; question += 1) {
    await shots.advance(1600 + question * 240);
    await answerChoice(page, !MISSED.has(question), question < 10);
  }

  // the grade splash clears itself, so it is shot without settling
  await expect(splash(page)).toBeVisible();
  await shots.snap("12_Result_Splash", "allow");
  await expect(splash(page)).toBeHidden();

  await expect(button("Run it again")).toBeVisible();
  await shots.top();
  await shots.shot("13_Result_Score");

  // load the misses as the next practice set
  await button("Practice my mistakes").click();
  await expect(startRun).toBeEnabled();
  await shots.top();
  await shots.reveal(page.getByText(/Loaded \d+ characters/));
  await shots.shot("14_Setup_Mistakes");

  // reports screen, filtered by window
  await button("Reports", true).click();
  await button("Last week", true).click();
  await shots.top();
  await shots.shot("15_Reports_LastWeek");

  await shots.reveal(page.getByText("Mistakes by group"));
  await shots.shot("16_Reports_Mistakes");
  await shots.top();

  // export the selected runs to a .kt-report file
  const runs = page.getByRole("button", { name: /\d+\/\d+ correct/ });
  await runs.nth(0).click();
  await runs.nth(1).click();

  const saved = page.waitForEvent("download");
  await button(/^Export/).click();
  const file = await (await saved).path();
  await shots.top();
  await shots.shot("17_Reports_Export");

  // remove the selection, which asks first
  await button(/^Remove \d+ selected/).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await shots.shot("18_Reports_RemoveConfirm");
  await button("Remove 2 runs", true).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);

  // import the runs back from the exported file
  const picker = page.waitForEvent("filechooser");
  await button(/^Import runs/).click();
  await (await picker).setFiles(file);
  await expect(page.getByText("Imported 2 runs.")).toBeVisible();
  // offset keeps the run count above the message in frame
  await shots.reveal(page.getByText("Imported 2 runs."), 210);
  await shots.shot("19_Reports_Imported");
  await shots.top();

  await button("Chart", true).click();
  await expect(page.getByRole("heading", { name: /Seion/ })).toBeVisible();
  await openRow(page, "A-row");
  await openRow(page, "K-row");
  await shots.top();
  await shots.shot("20_Chart_Characters");

  // settings, in a sheet on a phone and in the header on a wide window
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

  console.log(`  ${shots.count} stills in packaging/repo/${testInfo.project.name}`);
});
