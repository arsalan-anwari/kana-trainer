<script lang="ts">
  import { zoomMax, zoomMin, type Theme } from "../../core/prefs";
  import { app } from "../../state.svelte";
  import LanguagePicker from "./LanguagePicker.svelte";
  import { t } from "../../i18n.svelte";
  import { Chip, Icon, IconButton, lockScroll, Switch } from "kaizen-ui";

  let { onclose }: { onclose: () => void } = $props();

  const themes: Theme[] = ["system", "light", "dark"];

  const themeLabel: Record<Theme, string> = {
    system: "prefs.themeSystem",
    light: "prefs.themeLight",
    dark: "prefs.themeDark"
  };

  let panel: HTMLDialogElement;

  $effect(() => {
    panel.showModal();
  });
</script>

<dialog
  bind:this={panel}
  class="fixed inset-0 z-50 flex flex-col paper fullscreen-sheet"
  use:lockScroll
  aria-label={t("common.settings")}
  onclose={onclose}
>
  <header class="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
    <span class="text-h4 font-bold">{t("common.settings")}</span>
    <IconButton icon="close" label={t("common.closeSettings")} onclick={onclose} />
  </header>

  <div
    class="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]"
  >
    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("prefs.theme")}
      </span>
      <div class="grid grid-cols-3 gap-2">
        {#each themes as theme (theme)}
          <Chip
            size="sm"
            class="w-full"
            disabled={app.prefs.contrast}
            active={!app.prefs.contrast && app.prefs.theme === theme}
            onclick={() => app.setPref("theme", theme)}
          >
            {t(themeLabel[theme])}
          </Chip>
        {/each}
      </div>
      <Switch
        label={t("prefs.contrast")}
        hint={t("prefs.contrastHint")}
        checked={app.prefs.contrast}
        onchange={(value) => app.setPref("contrast", value)}
      />
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("prefs.zoom")}
      </span>
      <div
        class="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3"
      >
        <span class="flex flex-col gap-0.5">
          <span class="text-sm font-semibold leading-tight">{t("prefs.scale")}</span>
          <span class="text-xs leading-snug text-muted-foreground">
            {t("prefs.scaleHint")}
          </span>
        </span>
        <span class="flex shrink-0 items-center gap-2">
          <IconButton
            size="sm"
            icon="zoom-out"
            label={t("prefs.zoomOut")}
            disabled={app.prefs.zoom <= zoomMin}
            onclick={() => app.zoomBy(-1)}
          />
          <span class="w-12 text-center text-sm font-semibold tabular-nums">
            {Math.round(app.prefs.zoom * 100)}%
          </span>
          <IconButton
            size="sm"
            icon="zoom-in"
            label={t("prefs.zoomIn")}
            disabled={app.prefs.zoom >= zoomMax}
            onclick={() => app.zoomBy(1)}
          />
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("prefs.sound")}
      </span>
      <Switch
        label={t("prefs.effects")}
        hint={t("prefs.effectsHint")}
        checked={app.prefs.effects}
        onchange={(value) => app.setPref("effects", value)}
      />
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("prefs.language")}
      </span>
      <LanguagePicker full />
    </div>

    <p class="flex items-center gap-2 text-xs text-muted-foreground">
      <Icon name="sliders" class="size-4 shrink-0" />
      {t("prefs.persist")}
    </p>
  </div>
</dialog>
