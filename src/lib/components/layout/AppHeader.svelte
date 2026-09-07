<script lang="ts">
  import { tabRoutes, type TabRoute } from "../../core/prefs";
  import { app } from "../../state.svelte";
  import AppControls from "./AppControls.svelte";
  import SettingsMenu from "./SettingsMenu.svelte";
  import { t } from "../../i18n.svelte";
  import { AppMark, IconButton, Segmented } from "kaizen-ui";

  let menu = $state(false);
</script>

<div class="@container">
  <header class="flex flex-col gap-3 @min-[73rem]:flex-row @min-[73rem]:items-center @min-[73rem]:justify-between">
    <div class="flex items-center gap-3">
      <AppMark glyph="あ" class="size-10 shrink-0 text-h3 @min-[73rem]:size-11" />
      <div class="flex flex-col">
        <span class="text-h4 font-bold leading-tight">{t("common.appName")}</span>
        <span class="text-xs text-muted-foreground">{t("common.tagline")}</span>
      </div>
      
      <IconButton
        class="ml-auto @min-[73rem]:hidden"
        icon="sliders"
        label={t("common.settings")}
        active={menu}
        onclick={() => (menu = true)}
      />
    </div>

    <nav class="items-center gap-2 {app.route === 'quiz' ? 'hidden @min-[73rem]:flex' : 'flex'}">
      
      {#if app.route !== "quiz"}
        
        <Segmented
          full
          class="flex-1 @min-[73rem]:flex-none"
          items={tabRoutes.map((route) => ({ value: route, label: t(`common.nav.${route}`) }))}
          value={app.route as TabRoute}
          onpick={(route) => app.go(route)}
        />
      {/if}
      
      <span class="ml-3 hidden border-l border-border pl-3 @min-[73rem]:ml-4 @min-[73rem]:flex @min-[73rem]:pl-4">
        <AppControls />
      </span>
    </nav>
  </header>
</div>

{#if menu}
  <SettingsMenu onclose={() => (menu = false)} />
{/if}
