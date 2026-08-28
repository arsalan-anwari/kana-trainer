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

  function keydown(event: KeyboardEvent): void {
    if (!event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    app.shiftTab(event.key === "ArrowRight" ? 1 : -1);
  }

  // minimum horizontal distance in px for a swipe to change tab
  const SWIPE = 70;
  let startX = 0;
  let startY = 0;

  function touchstart(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  }

  function touchend(event: TouchEvent): void {
    // an open sheet or dialog owns the screen
    if (document.querySelector('[role="dialog"], [role="alertdialog"]') !== null) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    // the move must be clearly horizontal to count as a swipe
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy) * 2) return;
    app.shiftTab(dx < 0 ? 1 : -1);
  }
</script>

<svelte:window onkeydown={keydown} ontouchstart={touchstart} ontouchend={touchend} />

<div class="min-h-dvh w-full">
  <main
    class="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] sm:gap-5 sm:px-6 sm:pt-7 sm:pb-7 lg:px-10 lg:py-9"
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
