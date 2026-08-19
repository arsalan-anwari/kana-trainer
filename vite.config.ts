import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
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
