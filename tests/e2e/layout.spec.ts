import { expect, test } from "@playwright/test";


test("the header holds the top of the page while the content scrolls", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 420 });
  await page.goto("/");
  await expect(page.locator("#splash")).toHaveCount(0);

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
    await page.getByRole("tab", { name: tab, exact: true }).click();
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflow, `${tab} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});

test("the header stays flat only while it fits", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("kana-trainer-prefs", JSON.stringify({ lang: "fr" }));
  });

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

test("a run in landscape sits the prompt beside the answers and never scrolls", async ({
  page
}) => {
  for (const size of [
    { width: 844, height: 390 },
    { width: 1180, height: 820 }
  ]) {
    for (const style of ["", "Typing", "Text to audio"]) {
      await page.setViewportSize(size);
      await page.goto("/");
      await expect(page.locator("#splash")).toHaveCount(0);
      if (style !== "") await page.getByRole("button", { name: style }).first().click();
      await page.getByRole("button", { name: "Start run" }).click();
      await expect(page.getByText("1 / 20")).toBeVisible();

      const where = `${style === "" ? "multiple choice" : style} at ${size.width}x${size.height}`;
      const box = await page.evaluate(() => {
        const [prompt, answers] = [...document.querySelectorAll(".anim-pop > div")];
        const root = document.documentElement;
        return {
          overflow: root.scrollHeight - root.clientHeight,
          stacked: answers.getBoundingClientRect().top >= prompt.getBoundingClientRect().bottom
        };
      });

      expect(box.stacked, `${where} still stacks`).toBe(false);
      expect(box.overflow, `${where} scrolls`).toBeLessThanOrEqual(0);

      // The half-finished run is saved, so the next pass would reopen on the
      // quiz instead of the setup it needs.
      await page.evaluate(() => localStorage.clear());
    }
  }
});
