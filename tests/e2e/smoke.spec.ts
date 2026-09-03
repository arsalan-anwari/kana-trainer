import { expect, test, type Page } from "@playwright/test";

async function openApp(page: Page): Promise<void> {
  await page.goto("/");
  // the splash carries its own "Kana Trainer" text over the app
  await expect(page.locator("#splash")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 3, name: "Alphabets" })).toBeVisible();
}

// Progress of the shared kana audio element, or -1 when it has not played.
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

  // only the check button commits the pick
  await expect(page.getByRole("button", { name: "Check" })).toBeEnabled();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
});

test("a wrong typed answer holds the red verdict", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: "Typing" }).click();
  await page.getByRole("button", { name: "Start run" }).click();

  const field = page.locator("input[type=text]");
  await field.fill("zzz");
  // submitting with Enter must not also count as dismissing the verdict
  await field.press("Enter");

  await expect(page.getByText("Not quite")).toBeVisible();
  await expect(field).toHaveClass(/border-danger/);
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
});

test("the chart lists every character and plays one", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: "Chart" }).click();

  await expect(page.getByRole("heading", { name: /Seion/ })).toBeVisible();

  // rows start closed, so open them before the tiles exist
  const closed = page.getByRole("button", { name: /^Show / });
  for (let left = await closed.count(); left > 0; left -= 1) await closed.first().click();
  await expect(page.getByRole("button", { name: /^Play / })).toHaveCount(147);

  await page.getByRole("button", { name: /^Play kyo/ }).click();
  await expect.poll(() => playedSeconds(page), { timeout: 15_000 }).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: /^Play kyo/ })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});
