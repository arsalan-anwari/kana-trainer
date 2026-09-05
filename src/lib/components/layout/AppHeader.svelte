<script lang="ts">
  import { tabRoutes } from "../../core/prefs";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import AppControls from "./AppControls.svelte";
  import AppMark from "./AppMark.svelte";
  import SettingsMenu from "./SettingsMenu.svelte";
  import { t } from "../../i18n.svelte";

  let menu = $state(false);
</script>

<!-- The flat row needs 64.3rem at its widest, which is French: the longest
     tagline, the longest tab labels and a language picker as wide as its
     longest entry. 68rem leaves a little room for fonts that set wider than
     the ones measured on. Below that the whole strip moves into the sheet
     behind the sliders button.

     Asking the container rather than the viewport keeps this true at every
     zoom level, since rem here follows the root font size the zoom control
     sets. tests/e2e/layout.spec.ts holds the number honest. -->
<div class="@container">
  <header class="flex flex-col gap-3 @min-[68rem]:flex-row @min-[68rem]:items-center @min-[68rem]:justify-between">
    <div class="flex items-center gap-3">
      <AppMark class="size-10 shrink-0 text-h3 @min-[68rem]:size-11" />
      <div class="flex flex-col">
        <span class="text-h4 font-bold leading-tight">{t("common.appName")}</span>
        <span class="hidden text-xs text-muted-foreground @min-[68rem]:block">
          {t("common.tagline")}
        </span>
      </div>
      <!-- opens the settings sheet on a phone -->
      <IconButton
        class="ml-auto @min-[68rem]:hidden"
        icon="sliders"
        label={t("common.settings")}
        active={menu}
        onclick={() => (menu = true)}
      />
    </div>

    <nav class="items-center gap-2 {app.route === 'quiz' ? 'hidden @min-[68rem]:flex' : 'flex'}">
      <!-- a run owns the screen, so the tabs step aside and give back the height -->
      {#if app.route !== "quiz"}
        {#each tabRoutes as route (route)}
          <Button
            size="sm"
            class="flex-1 @min-[68rem]:flex-none"
            variant={app.route === route ? "secondary" : "ghost"}
            onclick={() => app.go(route)}
          >
            {t(`common.nav.${route}`)}
          </Button>
        {/each}
      {/if}
      <!-- separated from the three screen buttons -->
      <span class="ml-3 hidden border-l border-border pl-3 @min-[68rem]:ml-4 @min-[68rem]:flex @min-[68rem]:pl-4">
        <AppControls />
      </span>
    </nav>
  </header>
</div>

{#if menu}
  <SettingsMenu onclose={() => (menu = false)} />
{/if}
