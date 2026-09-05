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
  // French is the widest language: the longest tagline, the longest tab labels
  // and a picker as wide as its longest entry. If the flat row holds here it
  // holds everywhere, so this is what pins the breakpoint in AppHeader.
  await page.addInitScript(() => {
    localStorage.setItem("kana-trainer-prefs", JSON.stringify({ lang: "fr" }));
  });

  // 640px to 800px used to run the flat header past the right edge, and 800px
  // to 1100px used to wrap the tagline and squash the mark into an oval
  for (const width of [640, 700, 760, 800, 900, 1100, 1200, 1400]) {
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
      const lines = (element: Element): number =>
        Math.round(
          element.getBoundingClientRect().height /
            parseFloat(getComputedStyle(element).lineHeight)
        );
      // the tagline only shows in the flat row, where it must stay on one line
      const tagline = title.nextElementSibling!;
      const mark = header.querySelector("span.kana")!.getBoundingClientRect();
      return {
        overflow: last.getBoundingClientRect().right - header.getBoundingClientRect().right,
        titleLines: lines(title),
        taglineLines: getComputedStyle(tagline).display === "none" ? 1 : lines(tagline),
        markSkew: Math.abs(mark.width - mark.height)
      };
    });

    expect(fit.overflow, `header overflows at ${width}px`).toBeLessThanOrEqual(0.5);
    expect(fit.titleLines, `title wraps at ${width}px`).toBe(1);
    expect(fit.taglineLines, `tagline wraps at ${width}px`).toBe(1);
    expect(fit.markSkew, `the mark is squashed at ${width}px`).toBeLessThanOrEqual(1);
  }
});
