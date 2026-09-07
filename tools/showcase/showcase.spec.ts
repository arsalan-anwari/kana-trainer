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

const CLOCK = Date.UTC(2026, 7, 19, 20, 30);

const SEED = 20260820;

const MISSED = new Set([3, 7]);

const LANGUAGE = "es";

const root = fileURLToPath(new URL("../..", import.meta.url));

test("record the showcase", async ({ page }, testInfo) => {
  const shots = new Showcase(page, join(root, "packaging/repo", testInfo.project.name));

  await page.addInitScript(applySeed, seedPayload({ now: CLOCK, effects: false }));
  await page.addInitScript(installShowcase, { randomSeed: SEED, clockStart: CLOCK });
  await page.goto("/");

  const button = (name: string | RegExp, exact = false) =>
    page.getByRole("button", { name, exact });
  const startRun = button("Start run");

  const backToSetup = async (): Promise<void> => {
    await button("Quit", true).click();
    await discardRun(page);
    await expect(startRun).toBeEnabled();
  };

  await expect(startRun).toBeEnabled();

  await shots.top();
  await shots.shot("01_Setup_TextOnly");

  await button("Audio to text").click();
  await shots.top();
  await shots.shot("02_Setup_AudioText");

  await button("Text to audio").click();
  await shots.top();
  await shots.shot("03_Setup_TextAudio");

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

  await shots.reveal(page.getByText("Run options", { exact: true }), 44);
  await button("Advanced").click();
  await shots.shot("05_Setup_RunOptions");
  await shots.top();

  await startRun.click();
  await answering(page);
  await shots.top();
  await shots.shot("06_Quiz_TextOnly_KanaRomaji");
  await backToSetup();

  await button("Romaji to kana").click();
  await startRun.click();
  await answering(page);
  await shots.top();
  await shots.shot("07_Quiz_TextOnly_RomajiKana");
  await backToSetup();

  await button("Audio to text").click();
  await button("Typing").click();
  await startRun.click();
  await silence(page);
  await shots.top();
  await shots.shot("08_Quiz_AudioText_Typing");

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

  await button("Text to audio").click();
  await startRun.click();
  await expect(page.getByRole("button", { name: "Sound 1" })).toBeEnabled();
  await page.getByRole("button", { name: "Sound 2" }).click();
  await silence(page);
  await shots.top();
  await shots.shot("10_Quiz_TextAudio_Sounds");

  await shots.advance(2400);
  await button("Check").click();
  await button("Quit", true).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await shots.shot("11_Quiz_QuitConfirm");
  await discardRun(page);
  await expect(startRun).toBeEnabled();

  await button("Text only").click();
  await button("Multiple choice").click();
  await button("Kana to romaji").click();
  await startRun.click();

  for (let question = 1; question <= 10; question += 1) {
    await shots.advance(1600 + question * 240);
    await answerChoice(page, !MISSED.has(question), question < 10);
  }

  await expect(splash(page)).toBeVisible();
  await shots.snap("12_Result_Splash", "allow");
  await expect(splash(page)).toBeHidden();

  await expect(button("Run it again")).toBeVisible();
  await shots.top();
  await shots.shot("13_Result_Score");

  await button("Practice mistakes").click();
  await expect(startRun).toBeEnabled();
  await shots.top();
  await shots.reveal(page.getByText(/Loaded \d+ characters/));
  await shots.shot("14_Setup_Mistakes");

  await button("Reports", true).click();
  await button("All", true).click();
  await shots.top();
  await shots.shot("15_Reports_All");

  await shots.reveal(page.getByText("Mistakes by group"));
  await shots.shot("16_Reports_Mistakes");
  await shots.top();

  const runs = page.getByRole("button", { name: /\d+\/\d+ correct/ });
  await runs.nth(0).click();
  await runs.nth(1).click();

  const saved = page.waitForEvent("download");
  await button(/^Export/).click();
  const file = await (await saved).path();
  await shots.top();
  await shots.shot("17_Reports_Export");

  await button(/^Delete \d+ selected/).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await shots.shot("18_Reports_RemoveConfirm");
  await button("Delete 2 runs", true).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);

  const picker = page.waitForEvent("filechooser");
  await button(/^Import runs/).click();
  await (await picker).setFiles(file);
  await expect(page.getByText("Imported 2 runs.")).toBeVisible();
  await shots.reveal(page.getByText("Imported 2 runs."), 210);
  await shots.shot("19_Reports_Imported");
  await shots.top();

  await button("Chart", true).click();
  await expect(page.getByRole("heading", { name: /Seion/ })).toBeVisible();
  await openRow(page, "A-row");
  await openRow(page, "K-row");
  await shots.top();
  await shots.shot("20_Chart_Characters");

  const sheet = button("Settings", true);
  if (await sheet.isVisible()) {
    await sheet.click();
    await shots.shot("21_Settings_Menu");

    const picker = page.getByRole("dialog").locator("select");
    await picker.selectOption(LANGUAGE);
    await shots.shot("22_Settings_Language");
    await picker.selectOption("en");
    await page.keyboard.press("Escape");
  } else {
    await button("High contrast", true).click();
    await shots.shot("21_Chart_HighContrast");
    await button("High contrast", true).click();

    await button("Practice", true).click();
    await expect(startRun).toBeEnabled();
    await shots.top();

    const picker = page.getByRole("navigation").locator("select");
    await picker.selectOption(LANGUAGE);
    await shots.shot("22_Setup_Language");
    await picker.selectOption("en");
    await expect(startRun).toBeEnabled();
  }

  console.log(`  ${shots.count} stills in packaging/repo/${testInfo.project.name}`);
});
