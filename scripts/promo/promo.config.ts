import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";

/**
 * A standalone playwright config for the promotion recording.
 */

const root = fileURLToPath(new URL("../..", import.meta.url));
const port = Number(process.env.PROMO_PORT ?? 4180);

export default defineConfig({
  testDir: fileURLToPath(new URL(".", import.meta.url)),
  testMatch: /promo\.spec\.ts/,
  outputDir: fileURLToPath(new URL("../../.promo/raw", import.meta.url)),
  timeout: 180_000,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    colorScheme: "light",
    viewport: { width: 1920, height: 1080 },
    video: { mode: "on", size: { width: 1920, height: 1080 } },
    launchOptions: {
      args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"]
    }
  },
  webServer: {
    command: `npm run preview -- --port ${port} --host 127.0.0.1 --strictPort`,
    cwd: root,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
    timeout: 120_000
  }
});
