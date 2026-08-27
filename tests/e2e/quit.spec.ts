import { expect, test } from "@playwright/test";

/**
 * Only a run that was seen through counts. Quitting throws the answers away,
 * and it always asks before it does.
 */

const reportCount = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () => (JSON.parse(localStorage.getItem("kana-trainer-reports") ?? "[]") as unknown[]).length
  );

async function startAndAnswer(page: import("@playwright/test").Page, howMany: number) {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start run" })).toBeEnabled();
  await page.getByRole("button", { name: "Start run" }).click();
  for (let index = 0; index < howMany; index += 1) {
    const tiles = page.locator("main button", { hasText: /^[1-4]/ });
    await expect(tiles.first()).toBeEnabled();
    await tiles.first().click();
    await page.waitForTimeout(900);
    const cont = page.getByRole("button", { name: "Continue" });
    if (await cont.count()) await cont.click({ timeout: 3000 }).catch(() => undefined);
  }
}

test.describe.configure({ mode: "parallel" });

test("quitting asks first, and cancelling returns to the run", async ({ page }) => {
    await startAndAnswer(page, 3);
  const before = await reportCount(page);

  await page.getByRole("button", { name: "Quit" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Stop this run?");
  await expect(dialog).toContainText("3 answers");
  await dialog.getByRole("button", { name: "Keep going" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Quit" })).toBeVisible();
  await expect(page.getByText("4 / 20")).toBeVisible();
  expect(await reportCount(page)).toBe(before);
});

test("confirming throws the run away without scoring it", async ({ page }) => {
    await startAndAnswer(page, 3);
  const before = await reportCount(page);

  await page.getByRole("button", { name: "Quit" }).click();
  await page.getByRole("button", { name: "Stop and discard" }).click();

  // straight back to setup: no splash, no result screen
  await expect(page.getByRole("heading", { level: 3, name: "Alphabets" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.getByText("Run it again")).toHaveCount(0);
  await page.waitForTimeout(600);
  expect(await reportCount(page)).toBe(before);
});

test("escape asks the same question", async ({ page }) => {
    await startAndAnswer(page, 1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Quit" })).toBeVisible();
});

test("leaving by the header asks, then lands where it was going", async ({ page }) => {
    await startAndAnswer(page, 2);
  const before = await reportCount(page);

  await page.getByRole("button", { name: "Chart", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Stop and discard" }).click();

  await expect(page.getByRole("heading", { name: /Seion/ })).toBeVisible();
  expect(await reportCount(page)).toBe(before);
});

test("a run that is finished still scores and splashes", async ({ page }) => {
    await page.goto("/");
  await expect(page.getByRole("button", { name: "Start run" })).toBeEnabled();
  const before = await reportCount(page);
  await page.getByRole("button", { name: "10", exact: true }).click();
  await startAndAnswer(page, 0);
  for (let index = 0; index < 10; index += 1) {
    const tiles = page.locator("main button", { hasText: /^[1-4]/ });
    await expect(tiles.first()).toBeEnabled();
    await tiles.first().click();
    await page.waitForTimeout(900);
    const cont = page.getByRole("button", { name: "Continue" });
    if (await cont.count()) await cont.click({ timeout: 3000 }).catch(() => undefined);
  }
  await expect(page.getByRole("status")).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(900);
  expect(await reportCount(page)).toBe(before + 1);
});
