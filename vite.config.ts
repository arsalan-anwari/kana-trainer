import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  clearScreen: false,
  publicDir: "data",
  optimizeDeps: {
    // only reached through import() in storage.ts, so pin them to the pre-bundle
    include: ["@tauri-apps/api/core", "@tauri-apps/plugin-dialog"]
  },
  server: {
    port: 1420,
    strictPort: true,
    // renders the first screen while the window is still opening
    warmup: {
      clientFiles: ["./src/main.ts", "./src/App.svelte", "./src/lib/components/setup/*.svelte"]
    },
    watch: { ignored: ["**/src-tauri/**", "**/build/**", "**/dist/**", "**/.flatpak-builder/**", "**/packaging/**"] }
  },
  build: {
    outDir: "src-tauri/dist",
    emptyOutDir: true,
    target: "esnext"
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
