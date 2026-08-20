import { expect, test, type Page } from "@playwright/test";

async function openApp(page: Page): Promise<void> {
  await page.goto("/");
  // the splash overlays the app and carries its own "Kana Trainer" text
  await expect(page.locator("#splash")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 3, name: "Alphabets" })).toBeVisible();
}

/** Progress of the shared kana audio element, or -1 when it has not played. */
function playedSeconds(page: Page): Promise<number> {
  return page.evaluate(() => {
    const element = document.querySelector<HTMLAudioElement>("[data-kana-audio]");
    return element === null ? -1 : element.currentTime;
  });
}

test("the app opens on the practice setup", async ({ page }) => {
  await openApp(page);
  await expect(page.locator("#app").getByText("Kana Trainer")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start run" })).toBeEnabled();
  await expect(page.getByRole("heading", { name: "Characters" })).toBeVisible();
});

test("a run starts and answers can be given", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: "Start run" }).click();

  await expect(page.getByRole("button", { name: "Quit" })).toBeVisible();
  await expect(page.getByText("1 / 20")).toBeVisible();

  // four answer tiles, numbered 1 to 4
  const tiles = page.locator("main button", { hasText: /^[1-4]/ });
  await tiles.first().click();

  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("2 / 20")).toBeVisible();
});

test("a character sound plays in the text to audio run", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: "Text to audio" }).click();
  await page.getByRole("button", { name: "Start run" }).click();

  const sound = page.getByRole("button", { name: "Sound 1" });
  await expect(sound).toBeVisible();
  await sound.click();

  await expect.poll(() => playedSeconds(page), { timeout: 15_000 }).toBeGreaterThan(0);
  await expect(sound).toHaveAttribute("aria-pressed", "true");

  // the pick is only committed by the check button
  await expect(page.getByRole("button", { name: "Check" })).toBeEnabled();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
});

test("the chart lists every character and plays one", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: "Chart" }).click();

  await expect(page.getByRole("heading", { name: /Seion/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Play / })).toHaveCount(104);

  await page.getByRole("button", { name: "Play kyo" }).click();
  await expect.poll(() => playedSeconds(page), { timeout: 15_000 }).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "Play kyo" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});
