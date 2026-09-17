import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function openApp(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.locator("#splash")).toHaveCount(0);
}

async function keyMode(page: Page): Promise<void> {
  await page.keyboard.press("Control+/");
  await expect(page.locator("html.kbd-nav")).toHaveCount(1);
}

async function scan(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
}

test("the setup screen has no accessibility violations", async ({ page }) => {
  await openApp(page);
  await expect(page.getByRole("heading", { level: 3, name: "Alphabets" })).toBeVisible();
  expect(await scan(page)).toEqual([]);
});

test("the chart screen has no accessibility violations", async ({ page }) => {
  await openApp(page);
  await page.getByRole("tab", { name: "Chart" }).click();
  await expect(page.getByRole("heading", { name: /Seion/ })).toBeVisible();
  expect(await scan(page)).toEqual([]);
});

test("the reports screen has no accessibility violations", async ({ page }) => {
  await openApp(page);
  await page.getByRole("tab", { name: "Reports" }).click();
  await expect(page.getByRole("heading", { name: "Weakest characters" })).toBeVisible();
  expect(await scan(page)).toEqual([]);
});

test("the quiz and result screens have no accessibility violations", async ({
  page,
  isMobile
}) => {
  test.skip(isMobile, "keyboard mode is desktop only");
  await openApp(page);
  await keyMode(page);
  await page.getByRole("button", { name: "Start run" }).click();
  await expect(page.getByRole("button", { name: "Quit" })).toBeVisible();
  expect(await scan(page)).toEqual([]);

  for (let index = 1; index <= 20; index += 1) {
    await expect(page.getByText(`${index} / 20`, { exact: true })).toBeVisible();
    await page.keyboard.press("1");
    await page.keyboard.press("Enter");
  }

  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Run it again" })).toBeVisible();
  expect(await scan(page)).toEqual([]);
});

for (const theme of ["dark", "high-contrast"] as const) {
  test(`the ${theme} theme has no accessibility violations`, async ({ page }) => {
    await openApp(page);
    await page.evaluate((name) => {
      document.documentElement.classList.remove("light", "dark", "high-contrast");
      document.documentElement.classList.add(name);
    }, theme);

    await expect(page.getByRole("heading", { level: 3, name: "Alphabets" })).toBeVisible();
    expect(await scan(page)).toEqual([]);

    await page.getByRole("tab", { name: "Reports" }).click();
    await expect(page.getByRole("heading", { name: "Weakest characters" })).toBeVisible();
    expect(await scan(page)).toEqual([]);
  });
}

test("every screen can be reached and driven with the keyboard alone", async ({
  page,
  isMobile
}) => {
  test.skip(isMobile, "keyboard mode is desktop only");
  await openApp(page);

  await page.keyboard.press("Control+ArrowRight");
  await expect(page.getByRole("tab", { name: "Practice", exact: true })).toHaveAttribute(
    "aria-selected",
    "true"
  );

  await keyMode(page);
  await page.keyboard.press("Control+ArrowRight");
  await expect(page.getByRole("tab", { name: "Reports", exact: true })).toHaveAttribute(
    "aria-selected",
    "true"
  );

  await page.keyboard.press("Control+ArrowLeft");
  await expect(page.getByRole("tab", { name: "Practice", exact: true })).toHaveAttribute(
    "aria-selected",
    "true"
  );

  await page.keyboard.press("Control+Shift+/");
  await expect(page.locator("html.kbd-nav")).toHaveCount(0);
  await page.keyboard.press("Control+ArrowRight");
  await expect(page.getByRole("tab", { name: "Practice", exact: true })).toHaveAttribute(
    "aria-selected",
    "true"
  );
});

test("keyboard mode walks between sections and shows where it is", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard mode is desktop only");
  await openApp(page);
  await keyMode(page);
  await expect(page.getByText("Keyboard mode")).toBeVisible();

  await page.keyboard.press("Shift+ArrowDown");
  const section = page.locator("[data-keynav]");
  await expect(section).toHaveCount(1);
  const started = await section.evaluate((element) => element.getBoundingClientRect().top);

  await page.keyboard.press("Shift+ArrowDown");
  await expect(section).toHaveCount(1);
  const moved = await section.evaluate((element) => element.getBoundingClientRect().top);
  expect(moved).toBeGreaterThan(started);

  await expect(page.locator("main :focus")).toHaveCount(1);
});

test("tab wraps inside the section keyboard mode landed on", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard mode is desktop only");
  await openApp(page);
  await keyMode(page);
  await page.keyboard.press("Shift+ArrowDown");

  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => document.querySelector("[data-keynav]")?.contains(document.activeElement) ?? false
      )
    ).toBe(true);
  }
});

test("the arrow keys move inside the section instead of scrolling the page", async ({
  page,
  isMobile
}) => {
  test.skip(isMobile, "keyboard mode is desktop only");
  await openApp(page);
  await keyMode(page);
  await page.keyboard.press("Shift+ArrowDown");

  await page.keyboard.press("ArrowDown");
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await page.keyboard.press("Control+ArrowDown");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test("a dialog holds the keyboard until it is closed", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: "Start run" }).click();
  await page.keyboard.press("Escape");
  const quit = page.getByRole("alertdialog");
  await expect(quit).toBeVisible();

  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => document.querySelector("[role='alertdialog']")?.contains(document.activeElement) ?? false
      )
    ).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(quit).toHaveCount(0);
});

test("the header carries no skip link", async ({ page }) => {
  await openApp(page);
  await expect(page.getByRole("link", { name: "Skip to content" })).toHaveCount(0);
});

test("a character grid is one tab stop and moves with the arrow keys", async ({
  page,
  isMobile
}) => {
  test.skip(isMobile, "phones collapse the character rows behind a disclosure");
  await openApp(page);

  const grid = page.locator("main .grid[style*='grid-template-columns']").first();
  const tiles = grid.locator("button");
  await expect(tiles.first()).toHaveAttribute("tabindex", "0");
  await expect(tiles.nth(1)).toHaveAttribute("tabindex", "-1");

  await tiles.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tiles.nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(tiles.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tiles.first()).toBeFocused();
});

test("the shortcut sheet opens on ? and lists the keys", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard mode is desktop only");
  await openApp(page);

  await page.keyboard.press("?");
  const sheet = page.getByRole("dialog", { name: "Keyboard shortcuts" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText("Switch page")).toBeVisible();
  await expect(sheet.getByText("Start keyboard mode")).toBeVisible();
  await expect(sheet.locator("kbd")).not.toHaveCount(0);
  expect(await scan(page)).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
});

test("the settings menu hides the shortcut sheet on a touch device", async ({
  page,
  isMobile
}) => {
  test.skip(!isMobile, "the desktop header keeps the controls outside the menu");
  await openApp(page);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("button", { name: "Keyboard shortcuts" })).toHaveCount(0);
});

test("a narrow desktop window still reaches the settings button", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard mode is desktop only");
  await page.setViewportSize({ width: 800, height: 800 });
  await openApp(page);
  await keyMode(page);

  await page.keyboard.press("Shift+ArrowDown");
  await page.keyboard.press("Shift+ArrowUp");
  await expect(page.getByRole("button", { name: "Settings" })).toBeFocused();
});
