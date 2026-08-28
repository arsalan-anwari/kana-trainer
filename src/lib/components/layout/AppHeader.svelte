<script lang="ts">
  import { tabRoutes } from "../../core/prefs";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import AppControls from "./AppControls.svelte";
  import AppMark from "./AppMark.svelte";
  import SettingsMenu from "./SettingsMenu.svelte";

  const labels: Record<(typeof tabRoutes)[number], string> = {
    setup: "Practice",
    reports: "Reports",
    chart: "Chart"
  };

  let menu = $state(false);
</script>

<header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div class="flex items-center gap-3">
    <AppMark class="size-10 text-h3 sm:size-11" />
    <div class="flex flex-col">
      <span class="text-h4 font-bold leading-tight">Kana Trainer</span>
      <span class="hidden text-xs text-muted-foreground sm:block">
        Hiragana and katakana practice
      </span>
    </div>
    <!-- opens the settings sheet on a phone -->
    <IconButton
      class="ml-auto sm:hidden"
      icon="sliders"
      label="Settings"
      active={menu}
      onclick={() => (menu = true)}
    />
  </div>

  <nav class="flex items-center gap-2">
    {#each tabRoutes as route (route)}
      <Button
        size="sm"
        class="flex-1 sm:flex-none"
        variant={app.route === route ? "secondary" : "ghost"}
        onclick={() => app.go(route)}
      >
        {labels[route]}
      </Button>
    {/each}
    <!-- separated from the three screen buttons -->
    <span class="ml-3 hidden border-l border-border pl-3 sm:ml-4 sm:flex sm:pl-4">
      <AppControls />
    </span>
  </nav>
</header>

{#if menu}
  <SettingsMenu onclose={() => (menu = false)} />
{/if}
