import { expect, test } from "@playwright/test";

// Quitting a run asks first and discards the answers.

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

  // back to setup, with no splash and no result screen
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

test("a run hides the tabs and gets them back on the way out", async ({ page }) => {
    await page.goto("/");
  await expect(page.getByRole("button", { name: "Chart", exact: true })).toBeVisible();

  await startAndAnswer(page, 2);
  // the run owns the screen, so the tabs step aside and give back the height
  await expect(page.getByRole("button", { name: "Chart", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reports", exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Quit" }).click();
  await page.getByRole("button", { name: "Stop and discard" }).click();
  await expect(page.getByRole("button", { name: "Chart", exact: true })).toBeVisible();
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
  // whichever grade it lands on, that grade's particle effect is on screen
  const particles = page.locator(
    ".anim-firework, .anim-confetti, .anim-sparkle, .anim-drift, .anim-rain"
  );
  expect(await particles.count()).toBeGreaterThan(10);
  await page.waitForTimeout(900);
  expect(await reportCount(page)).toBe(before + 1);
});
