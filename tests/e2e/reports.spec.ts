import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

// Exports runs to a .kt-report file, removes them and imports them back.

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

  await page.getByRole("button", { name: /^Delete all 2 runs shown/ }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Delete 2 runs?");
  await page.getByRole("button", { name: "Delete 2 runs" }).click();
  await expect(page.getByText("Deleted 2 runs.")).toBeVisible();
  expect(await storedIds(page)).toEqual([]);

  // the file goes through the chooser rather than a page input
  const chooser = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: /^Import runs/ }).click()
  ]).then(([event]) => event);
  await chooser.setFiles(file);
  await expect(page.getByText("Imported 2 runs.")).toBeVisible();
  expect(await storedIds(page)).toEqual(["run-one", "run-two"]);

  // importing the same file again is a no op
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

  await page.getByRole("button", { name: /^Delete all 2 runs shown/ }).click();
  await page.getByRole("button", { name: "Keep them" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  expect(await storedIds(page)).toEqual(["run-one", "run-two"]);
});

test("the summary heading follows the date filter and the tags", async ({ page }) => {
  await openReports(page, seed);

  const heading = page.locator("span.text-h2");
  const tags = page.locator("span.text-h2 ~ div span");
  await expect(heading).toHaveText("All");

  // the seeded runs are from today, so yesterday holds none of them and the
  // heading must not keep claiming it covers everything
  await page.getByRole("button", { name: "Yesterday", exact: true }).click();
  await expect(heading).toHaveText("Yesterday");

  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(heading).toHaveText("All");
  await expect(tags).toHaveCount(0);

  // a tag lands under the window as its own box, and takes the runs it does not match
  await page.getByText("Filters", { exact: true }).click();
  await page.getByRole("button", { name: "Typing", exact: true }).click();
  await expect(heading).toHaveText("All");
  await expect(tags).toHaveText(["Typing"]);
  await expect(page.getByText("No runs match these filters.")).toBeVisible();

  // a second tag in the same dimension widens the match again
  await page.getByRole("button", { name: "Multiple choice", exact: true }).click();
  await expect(tags).toHaveText(["Multiple choice", "Typing"]);
  await expect(page.getByRole("button", { name: /^Export all 2 runs shown/ })).toBeVisible();
});
