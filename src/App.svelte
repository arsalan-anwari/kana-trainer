<script lang="ts">
  import { app } from "./lib/state.svelte";
  import Button from "./lib/ui/Button.svelte";
  import QuizScreen from "./lib/components/QuizScreen.svelte";
  import ReportsScreen from "./lib/components/ReportsScreen.svelte";
  import ResultScreen from "./lib/components/ResultScreen.svelte";
  import SetupScreen from "./lib/components/SetupScreen.svelte";

  app.load();

  const designWidth = 680;
  const designHeight = 620;

  let windowWidth = $state(designWidth);
  let windowHeight = $state(designHeight);

  const scale = $derived(
    Math.min(1, windowWidth / designWidth, windowHeight / designHeight)
  );

  const themes: { value: "system" | "light" | "dark"; label: string }[] = [
    { value: "system", label: "Auto" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" }
  ];

  function cycleTheme(): void {
    const index = themes.findIndex((theme) => theme.value === app.prefs.theme);
    app.prefs.theme = themes[(index + 1) % themes.length].value;
    app.applyPrefs();
  }
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<main
  class="flex flex-col gap-5 p-4 xl:p-6"
  style="width: {windowWidth / scale}px; height: {windowHeight / scale}px; transform: scale({scale}); transform-origin: top left;"
>
  <header class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span class="kana flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-h3 font-bold text-brand-foreground">
        あ
      </span>
      <div class="flex flex-col">
        <span class="text-h4 font-bold leading-none">Kana Trainer</span>
        <span class="text-xs text-muted-foreground">Hiragana and katakana practice</span>
      </div>
    </div>
    <nav class="flex items-center gap-2">
      <Button
        size="sm"
        variant={app.route === "setup" ? "secondary" : "ghost"}
        onclick={() => app.go("setup")}
      >
        Practice
      </Button>
      <Button
        size="sm"
        variant={app.route === "reports" ? "secondary" : "ghost"}
        onclick={() => app.go("reports")}
      >
        Reports
      </Button>
      <Button size="sm" variant="outline" onclick={cycleTheme}>
        {themes.find((theme) => theme.value === app.prefs.theme)?.label}
      </Button>
    </nav>
  </header>

  <div class="min-h-0 flex-1">
    {#if app.route === "setup"}
      <SetupScreen />
    {:else if app.route === "quiz"}
      <QuizScreen />
    {:else if app.route === "result"}
      <ResultScreen />
    {:else}
      <ReportsScreen />
    {/if}
  </div>
</main>
