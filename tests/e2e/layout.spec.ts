import { expect, test } from "@playwright/test";

// The app header used to scroll up behind the Android status bar, and wide
// layouts used to run past the right edge under the navigation strip.

test("the header holds the top of the page while the content scrolls", async ({ page }) => {
  // short enough that the setup screen has to scroll
  await page.setViewportSize({ width: 360, height: 420 });
  await page.goto("/");
  await expect(page.locator("#splash")).toHaveCount(0);

  // cards carry their own <header>, so take the app one
  const header = page.locator("header").first();
  const top = (await header.boundingBox())?.y;
  expect(top).toBeDefined();

  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  expect((await header.boundingBox())?.y).toBeCloseTo(top ?? -1, 0);
});

test("no screen runs past the right edge", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#splash")).toHaveCount(0);

  for (const tab of ["Reports", "Chart", "Practice"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflow, `${tab} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});

test("the header stays flat only while it fits", async ({ page }) => {
  // 640px to 800px used to run the flat header past the right edge
  for (const width of [640, 700, 760, 800, 900, 1100]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await expect(page.locator("#splash")).toHaveCount(0);

    const fit = await page.evaluate(() => {
      const header = document.querySelector("header")!;
      const title = [...header.querySelectorAll("span")].find(
        (span) => span.textContent?.trim() === "Kana Trainer"
      )!;
      const buttons = header.querySelectorAll("button");
      const last = buttons[buttons.length - 1];
      const lineHeight = parseFloat(getComputedStyle(title).lineHeight);
      return {
        overflow: last.getBoundingClientRect().right - header.getBoundingClientRect().right,
        titleLines: Math.round(title.getBoundingClientRect().height / lineHeight)
      };
    });

    expect(fit.overflow, `header overflows at ${width}px`).toBeLessThanOrEqual(0.5);
    expect(fit.titleLines, `title wraps at ${width}px`).toBe(1);
  }
});

test("the verdict pins to the bottom without moving the run", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#splash")).toHaveCount(0);
  // typing, so the answer can be made wrong on purpose: a correct one
  // auto-advances after 700ms and takes the verdict away with it
  await page.getByRole("button", { name: "Typing" }).click();
  await page.getByRole("button", { name: "Start run" }).click();
  await page.getByRole("button", { name: "Quit" }).waitFor();
  await page.waitForTimeout(400); // the pop-in animation offsets the first frames

  const measure = () =>
    page.evaluate(() => {
      const content = document.querySelector("main .anim-pop")!;
      const root = document.documentElement;
      return {
        top: Math.round(content.getBoundingClientRect().top + window.scrollY),
        height: root.scrollHeight
      };
    });

  const before = await measure();
  const field = page.locator("input[type=text]");
  await field.fill("zzz");
  await field.press("Enter");
  await expect(page.getByText("Not quite")).toBeVisible();
  await page.waitForTimeout(400);

  // the question must not jump, and the page must not grow a scrollbar
  expect(await measure()).toEqual(before);

  // a fixed bar is only guaranteed to clear the tiles at the end of the page,
  // which is what the reserved band under the run is sized for
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);

  const bar = await page.evaluate(() => {
    const el = [...document.querySelectorAll("div")].find(
      (node) =>
        getComputedStyle(node).position === "fixed" && node.textContent?.includes("Continue")
    )!;
    const box = el.getBoundingClientRect();
    // the bar carries .anim-pop too, so scope this to the run's own wrapper
    const run = document.querySelector("main .anim-pop")!;
    const lowest = Math.max(
      ...[...run.querySelectorAll("button, input")].map(
        (node) => node.getBoundingClientRect().bottom
      )
    );
    return {
      atBottom: Math.round(window.innerHeight - box.bottom),
      covers: lowest - box.top
    };
  });

  expect(bar.atBottom).toBe(0);
  expect(bar.covers, "the verdict bar hides an answer tile").toBeLessThanOrEqual(0);
});
