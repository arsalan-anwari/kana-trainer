import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

/**
 * The reports screen keeps a history that has to survive leaving the machine:
 * export the picked runs to one .kt-report file, wipe them, import the file
 * back and find the same runs.
 */

type Seed = { id: string; createdAt: string };

const seed: Seed[] = [
  { id: "run-one", createdAt: new Date(Date.now() - 60_000).toISOString() },
  { id: "run-two", createdAt: new Date(Date.now() - 30_000).toISOString() }
];

async function openReports(page: import("@playwright/test").Page, runs: Seed[]) {
  await page.goto("/");
  await page.evaluate((items) => {
    const reports = items.map((item) => ({
      ...item,
      durationMs: 20_000,
      settings: JSON.parse(localStorage.getItem("kana-trainer-settings") ?? "null") ?? {
        scripts: ["hiragana"],
        format: "kana-romaji",
        answerStyle: "choice",
        questionCount: 10,
        selections: { hiragana: ["a"], katakana: ["a"] }
      },
      answers: [
        { kanaId: "a", script: "hiragana", correct: true, timedOut: false, elapsedMs: 800, given: "a" }
      ]
    }));
    localStorage.setItem("kana-trainer-reports", JSON.stringify(reports));
  }, runs);
  await page.reload();
  await page.getByRole("button", { name: "Reports" }).click();
}

const storedIds = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    (JSON.parse(localStorage.getItem("kana-trainer-reports") ?? "[]") as { id: string }[])
      .map((report) => report.id)
      .sort()
  );

test("runs export to one file, and import back after being removed", async ({ page }) => {
  await openReports(page, seed);

  const download = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /^Export all 2 runs shown/ }).click()
  ]).then(([event]) => event);
  const file = await download.path();
  expect(download.suggestedFilename()).toMatch(/\.kt-report$/);
  const bytes = await readFile(file);
  expect(bytes.subarray(0, 8).toString("ascii")).toBe("KTREPORT");

  await page.getByRole("button", { name: /^Remove all 2 runs shown/ }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Remove 2 runs?");
  await page.getByRole("button", { name: "Remove 2 runs" }).click();
  await expect(page.getByText("Removed 2 runs.")).toBeVisible();
  expect(await storedIds(page)).toEqual([]);

  // the picker input never enters the page, so the file goes through the chooser
  const chooser = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: /^Import runs/ }).click()
  ]).then(([event]) => event);
  await chooser.setFiles(file);
  await expect(page.getByText("Imported 2 runs.")).toBeVisible();
  expect(await storedIds(page)).toEqual(["run-one", "run-two"]);

  // importing the same file again is a no op, which is what keeps two devices
  // in step rather than piling up copies
  const again = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: /^Import runs/ }).click()
  ]).then(([event]) => event);
  await again.setFiles(file);
  await expect(page.getByText("Imported 0 runs, 2 already here.")).toBeVisible();
  expect(await storedIds(page)).toEqual(["run-one", "run-two"]);
});

test("cancelling the delete dialog keeps the runs", async ({ page }) => {
  await openReports(page, seed);

  await page.getByRole("button", { name: /^Remove all 2 runs shown/ }).click();
  await page.getByRole("button", { name: "Keep them" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  expect(await storedIds(page)).toEqual(["run-one", "run-two"]);
});
