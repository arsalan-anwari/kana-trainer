import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  clearScreen: false,
  optimizeDeps: {
    // Only reached through `import()` inside storage.ts. Naming them pins them
    // to the startup pre-bundle, so a scan that misses them can never trigger a
    // mid-session re-optimise and the full page reload that comes with it.
    include: ["@tauri-apps/api/core", "@tauri-apps/plugin-dialog"]
  },
  server: {
    port: 1420,
    strictPort: true,
    // transform the first screen while the window is still opening
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
