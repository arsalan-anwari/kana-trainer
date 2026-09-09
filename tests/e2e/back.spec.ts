import { expect, test } from "@playwright/test";

/* The android back button and back swipe reach the webview as a history step,
   and with nothing on the stack the app closes under the open sheet. Every
   overlay pushes an entry while it is open, so a back step closes the overlay. */

test("back closes the settings sheet instead of leaving the app", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await expect(page.locator("#splash")).toHaveCount(0);

  const sheet = page.getByRole("dialog", { name: "Settings" });

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(sheet).toBeVisible();
  await page.goBack();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 3, name: "Alphabets" })).toBeVisible();

  // closing by the button has to take the entry back off, or the next back drifts
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "Close settings" }).click();
  await expect(sheet).toHaveCount(0);

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(sheet).toBeVisible();
  await page.goBack();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 3, name: "Alphabets" })).toBeVisible();
});

test("back peels one overlay at a time", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await expect(page.locator("#splash")).toHaveCount(0);

  const sheet = page.getByRole("dialog", { name: "Settings" });

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await sheet.getByLabel("Language").click();
  const options = page.getByRole("option", { name: "Nederlands" });
  await expect(options).toBeVisible();

  await page.goBack();
  await expect(options).toHaveCount(0);
  await expect(sheet).toBeVisible();

  await page.goBack();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 3, name: "Alphabets" })).toBeVisible();
});

test("back answers the quit dialog with keep going", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start run" })).toBeEnabled();
  await page.getByRole("button", { name: "Start run" }).click();

  await page.getByRole("button", { name: "Quit" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();

  await page.goBack();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Quit" })).toBeVisible();
});
