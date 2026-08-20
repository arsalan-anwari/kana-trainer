import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

/**
 * A standalone playwright config for the readme stills. Two projects, one
 * script: the same scenes are shot at a desktop window and at a phone, and the
 * project name decides which folder under docs/ they land in.
 */

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
    // the reports list prints timestamps, so the machine's locale is pinned too
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
      // pixel 7 at a round scale factor, 2.625 makes for awkward png sizes
      use: { ...devices["Pixel 7"], deviceScaleFactor: 2 }
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
