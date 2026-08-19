<script lang="ts">
  import { app } from "./lib/state.svelte";
  import AppHeader from "./lib/components/layout/AppHeader.svelte";
  import QuizScreen from "./lib/components/quiz/QuizScreen.svelte";
  import ReportsScreen from "./lib/components/reports/ReportsScreen.svelte";
  import ResultScreen from "./lib/components/result/ResultScreen.svelte";
  import SetupScreen from "./lib/components/setup/SetupScreen.svelte";

  app.load();
</script>

<div class="min-h-dvh w-full">
  <main
    class="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9"
  >
    <AppHeader />

    {#if app.route === "setup"}
      <SetupScreen />
    {:else if app.route === "quiz"}
      <QuizScreen />
    {:else if app.route === "result"}
      <ResultScreen />
    {:else}
      <ReportsScreen />
    {/if}
  </main>
</div>
