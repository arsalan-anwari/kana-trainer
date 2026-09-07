<script lang="ts">
  import type { Component } from "svelte";
  import { app, type Route } from "./lib/state.svelte";
  import AppHeader from "./lib/components/layout/AppHeader.svelte";
  import { PageBackdrop } from "kaizen-ui";
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

  // measured so the setup sidebar can stick clear of the app header
  let headerHeight = $state(0);

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

<!-- --edge-x/y are the plain page margins; every edge adds the matching system
     inset on top so nothing sits under a status bar or navigation strip -->
<div
  class="flex min-h-dvh w-full flex-col [--edge-x:1rem] [--edge-y:0.75rem] pl-[calc(env(safe-area-inset-left,0px)+var(--edge-x))] pr-[calc(env(safe-area-inset-right,0px)+var(--edge-x))] sm:[--edge-x:1.5rem] sm:[--edge-y:1.75rem] lg:[--edge-x:2.5rem] lg:[--edge-y:2.25rem]"
  style="--header-height: {headerHeight}px"
>
  <PageBackdrop />

  <!-- Sticky, so a scrolled page never draws into the status bar band, and
       covered, so what scrolls under it never shows through its own text. The
       room behind the page picks up below it: the drawing is anchored to the
       bottom edge, so the bar only ever hides its ceiling.

       The negative margins undo the page margins so the cover reaches both
       screen edges, and the bar's own padding puts them back: the row inside
       keeps exactly the box every other screen lines up with. -->
  <div
    bind:clientHeight={headerHeight}
    class="scrim sticky top-0 z-20 -ml-[calc(env(safe-area-inset-left,0px)+var(--edge-x))] -mr-[calc(env(safe-area-inset-right,0px)+var(--edge-x))] pt-[calc(env(safe-area-inset-top,0px)+var(--edge-y))] pr-[calc(env(safe-area-inset-right,0px)+var(--edge-x))] pb-8 pl-[calc(env(safe-area-inset-left,0px)+var(--edge-x))] sm:pb-10"
  >
    <div class="mx-auto w-full max-w-6xl">
      <AppHeader />
    </div>
  </div>

  <!-- relative z-10 so the page sits over the classroom drawn behind it -->
  <main
    class="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 pb-[calc(env(safe-area-inset-bottom,0px)+var(--edge-y))] sm:gap-5"
  >
    {#if app.route === "setup"}
      <SetupScreen />
    {:else}
      {#await screens[app.route]() then { default: Screen }}
        <Screen />
      {/await}
    {/if}
  </main>
</div>
