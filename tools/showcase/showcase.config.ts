import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

// Standalone playwright config for the readme stills, one project per size.

const root = fileURLToPath(new URL("../..", import.meta.url));
const port = Number(process.env.SHOWCASE_PORT ?? 4181);

export default defineConfig({
  testDir: fileURLToPath(new URL(".", import.meta.url)),
  testMatch: /showcase\.spec\.ts/,
  outputDir: fileURLToPath(new URL("../../.showcase/raw", import.meta.url)),
  timeout: 300_000,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    colorScheme: "light",
    // pinned so the timestamps in the reports list do not vary by machine
    locale: "en-US",
    timezoneId: "UTC",
    launchOptions: {
      args: [
        "--autoplay-policy=no-user-gesture-required",
        "--hide-scrollbars",
        "--mute-audio"
      ]
    }
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 }
    },
    {
      name: "phone",
      // pixel 7 at a round scale factor. The viewport is the whole screen, not
      // the browser one with its chrome taken off, because the app runs full
      // screen on a phone: 412x915 is what the user actually sees.
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 2
      }
    }
  ],
  webServer: {
    command: `npm run preview -- --port ${port} --host 127.0.0.1 --strictPort`,
    cwd: root,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
    timeout: 120_000
  }
});
