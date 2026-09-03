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

<!-- the flat row needs about 48rem; asking the container rather than the
     viewport keeps that true at every zoom level, since rem here follows the
     root font size the zoom control sets -->
<div class="@container">
  <header class="flex flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between">
    <div class="flex items-center gap-3">
      <AppMark class="size-10 text-h3 @3xl:size-11" />
      <div class="flex flex-col">
        <span class="text-h4 font-bold leading-tight">Kana Trainer</span>
        <span class="hidden text-xs text-muted-foreground @3xl:block">
          Hiragana and katakana practice
        </span>
      </div>
      <!-- opens the settings sheet on a phone -->
      <IconButton
        class="ml-auto @3xl:hidden"
        icon="sliders"
        label="Settings"
        active={menu}
        onclick={() => (menu = true)}
      />
    </div>

    <nav class="items-center gap-2 {app.route === 'quiz' ? 'hidden @3xl:flex' : 'flex'}">
      <!-- a run owns the screen, so the tabs step aside and give back the height -->
      {#if app.route !== "quiz"}
        {#each tabRoutes as route (route)}
          <Button
            size="sm"
            class="flex-1 @3xl:flex-none"
            variant={app.route === route ? "secondary" : "ghost"}
            onclick={() => app.go(route)}
          >
            {labels[route]}
          </Button>
        {/each}
      {/if}
      <!-- separated from the three screen buttons -->
      <span class="ml-3 hidden border-l border-border pl-3 @3xl:ml-4 @3xl:flex @3xl:pl-4">
        <AppControls />
      </span>
    </nav>
  </header>
</div>

{#if menu}
  <SettingsMenu onclose={() => (menu = false)} />
{/if}
