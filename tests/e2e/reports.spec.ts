import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";


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
  await page.getByRole("tab", { name: "Reports" }).click();
}

const openActions = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Run actions" }).click();

// The same text also lands in the sr-only announcer, so match the visible flash only.
const flash = (page: import("@playwright/test").Page, text: string) =>
  page.locator("p").filter({ hasText: text });

const storedIds = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    (JSON.parse(localStorage.getItem("kana-trainer-reports") ?? "[]") as { id: string }[])
      .map((report) => report.id)
      .sort()
  );

test("runs export to one file, and import back after being removed", async ({ page }) => {
  await openReports(page, seed);

  await openActions(page);
  const download = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /^Export all 2 runs shown/ }).click()
  ]).then(([event]) => event);
  const file = await download.path();
  expect(download.suggestedFilename()).toMatch(/\.kt-report$/);
  const bytes = await readFile(file);
  expect(bytes.subarray(0, 8).toString("ascii")).toBe("KTREPORT");

  await openActions(page);
  await page.getByRole("button", { name: /^Delete all 2 runs shown/ }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Delete 2 runs?");
  await page.getByRole("button", { name: "Delete 2 runs" }).click();
  await expect(flash(page, "Deleted 2 runs.")).toBeVisible();
  expect(await storedIds(page)).toEqual([]);

  await openActions(page);
  const chooser = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: /^Import runs/ }).click()
  ]).then(([event]) => event);
  await chooser.setFiles(file);
  await expect(flash(page, "Imported 2 runs.")).toBeVisible();
  expect(await storedIds(page)).toEqual(["run-one", "run-two"]);

  await openActions(page);
  const again = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: /^Import runs/ }).click()
  ]).then(([event]) => event);
  await again.setFiles(file);
  await expect(flash(page, "Imported 0 runs, 2 already here.")).toBeVisible();
  expect(await storedIds(page)).toEqual(["run-one", "run-two"]);
});

test("cancelling the delete dialog keeps the runs", async ({ page }) => {
  await openReports(page, seed);

  await openActions(page);
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

  await page.getByRole("button", { name: "Yesterday", exact: true }).click();
  await expect(heading).toHaveText("Yesterday");

  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(heading).toHaveText("All");
  await expect(tags).toHaveCount(0);

  await page.getByText("Filters", { exact: true }).click();
  await page.getByRole("button", { name: "Typing", exact: true }).click();
  await expect(heading).toHaveText("All");
  await expect(tags).toHaveText(["Typing"]);
  await expect(page.getByText("No runs match these filters.")).toBeVisible();

  await page.getByRole("button", { name: "Multiple choice", exact: true }).click();
  await expect(tags).toHaveText(["Multiple choice", "Typing"]);
  await expect(page.getByText("2 shown")).toBeVisible();
});

test("the date range picker filters down to one day", async ({ page }) => {
  await openReports(page, seed);

  const now = new Date();
  const day = String(now.getDate());
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  await page.getByRole("button", { name: "Pick a date range" }).click();
  const picker = page.getByRole("dialog", { name: "Date range" });

  // The first pick sets the start and moves on to the end, the second closes it.
  await picker.getByRole("button", { name: day, exact: true }).click();
  await picker.getByRole("button", { name: day, exact: true }).click();
  await picker.getByRole("button", { name: "Apply" }).click();

  await expect(page.locator("span.text-h2")).toHaveText("Custom");
  await expect(page.getByRole("button", { name: key })).toBeVisible();
  await expect(page.getByText("2 shown")).toBeVisible();
});

test("the report page scrolls back to the top on a phone", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the stacked single-column layout only happens on a phone");

  const many = Array.from({ length: 12 }, (_, index) => ({
    id: `run-${index}`,
    createdAt: new Date(Date.now() - index * 60_000).toISOString()
  }));
  await openReports(page, many);
  await expect(page.getByRole("heading", { name: "Weakest characters" })).toBeVisible();

  const height = () => page.evaluate(() => document.documentElement.scrollHeight);
  const settled = await height();

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(() => window.scrollY > 0);
  expect(await height()).toBe(settled);

  for (let top = await page.evaluate(() => window.scrollY); top > 0; top -= 200) {
    await page.evaluate((to) => window.scrollTo(0, to), Math.max(0, top - 200));
  }

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  expect(await height()).toBe(settled);
});

test("long run lists page instead of scrolling, and the pager works by keyboard", async ({
  page
}) => {
  const many = Array.from({ length: 20 }, (_, index) => ({
    id: `run-${index}`,
    createdAt: new Date(Date.now() - index * 60_000).toISOString()
  }));
  await openReports(page, many);

  const pager = page.getByRole("navigation", { name: "Report pages" });
  const rows = page.locator("[data-section] button[aria-pressed][class*='flex-col']");

  await expect(page.getByText("20 shown")).toBeVisible();
  await expect(rows).toHaveCount(4);
  // The pager is a counter plus two arrows, so it fits every column width.
  await expect(pager).toContainText("1 / 5");

  await pager.getByRole("button", { name: "Next page" }).click();
  await expect(pager).toContainText("2 / 5");
  await expect(rows).toHaveCount(4);

  await pager.getByRole("button", { name: "Previous page" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(pager.getByRole("button", { name: "Next page" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(pager).toContainText("3 / 5");

  await page.getByRole("button", { name: "Yesterday", exact: true }).click();
  await expect(pager).toHaveCount(0);
});

// Keyboard nav is off on touch devices, so this is a desktop-only concern.
test("keyboard nav walks the filters, the toolbar and the runs as separate sections", async ({
  page,
  isMobile
}) => {
  test.skip(isMobile === true, "keyboard navigation is disabled on touch");
  await openReports(page, seed);

  await page.keyboard.press("Control+/");
  await page.getByRole("button", { name: "All", exact: true }).focus();

  // Collapsed filters must not swallow the jump down to the runs.
  await page.keyboard.press("Shift+ArrowDown");
  await expect(page.getByRole("button", { name: "Select every run shown" })).toBeFocused();

  await page.keyboard.press("Shift+ArrowDown");
  await expect(page.locator("button[aria-pressed][class*='flex-col']").first()).toBeFocused();

  await page.keyboard.press("Shift+ArrowUp");
  await expect(page.getByRole("button", { name: "Select every run shown" })).toBeFocused();
});

// Regression: keyboard mode used to need a Shift+Arrow first, because nothing
// was marked yet and Tab fell through to the browser.
test("keyboard mode catches the very first Tab", async ({ page, isMobile }) => {
  test.skip(isMobile === true, "keyboard navigation is disabled on touch");
  await openReports(page, seed);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

  await page.keyboard.press("Control+/");
  await page.keyboard.press("Tab");

  await expect(page.locator("[data-keynav]").locator(":focus")).toHaveCount(1);
});
