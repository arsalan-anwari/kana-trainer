<script lang="ts">
  import type { Component } from "svelte";
  import { app, type Route } from "./lib/state.svelte";
  import AppHeader from "./lib/components/layout/AppHeader.svelte";
  import SetupScreen from "./lib/components/setup/SetupScreen.svelte";

  app.load();

  const screens: Record<Exclude<Route, "setup">, () => Promise<{ default: Component }>> = {
    quiz: () => import("./lib/components/quiz/QuizScreen.svelte"),
    result: () => import("./lib/components/result/ResultScreen.svelte"),
    chart: () => import("./lib/components/chart/ChartScreen.svelte"),
    reports: () => import("./lib/components/reports/ReportsScreen.svelte")
  };

  function warmScreens(): void {
    for (const load of Object.values(screens)) void load();
  }

  if (typeof requestIdleCallback === "function") requestIdleCallback(() => warmScreens());
  else setTimeout(warmScreens, 400);
</script>

<div class="min-h-dvh w-full">
  <main
    class="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9"
  >
    <AppHeader />

    {#if app.route === "setup"}
      <SetupScreen />
    {:else}
      {#await screens[app.route]() then { default: Screen }}
        <Screen />
      {/await}
    {/if}
  </main>
</div>
