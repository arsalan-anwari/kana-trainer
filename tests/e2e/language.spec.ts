import { expect, test } from "@playwright/test";

// Picking a language has to redraw the screens and survive a reload, which is
// the part the unit tests around t() cannot reach.
test("picking a language redraws the app and sticks", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#splash")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 3, name: "Alphabets" })).toBeVisible();

  // the header carries the picker on a desktop, the settings sheet on a phone
  const inHeader = page.getByRole("navigation").getByLabel("Language");
  if (await inHeader.isVisible()) {
    await inHeader.selectOption("nl");
  } else {
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    const sheet = page.getByRole("dialog", { name: "Settings" });
    await sheet.getByLabel("Language").selectOption("nl");
    await page.getByRole("button", { name: "Instellingen sluiten" }).click();
  }

  await expect(page.getByRole("heading", { level: 3, name: "Alfabetten" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Starten" })).toBeEnabled();

  await page.reload();
  await expect(page.locator("#splash")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 3, name: "Alfabetten" })).toBeVisible();
});
