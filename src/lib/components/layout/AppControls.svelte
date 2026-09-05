<script lang="ts">
  import { zoomMax, zoomMin } from "../../core/prefs";
  import { app } from "../../state.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import { t } from "../../i18n.svelte";
  import LanguagePicker from "./LanguagePicker.svelte";

  // The persistent settings as header icons.
</script>

<div class="flex items-center gap-1.5">
  <LanguagePicker />
  <ThemeToggle />
  <IconButton
    size="sm"
    icon="contrast"
    label={t("prefs.contrast")}
    active={app.prefs.contrast}
    onclick={() => app.setPref("contrast", !app.prefs.contrast)}
  />
  <IconButton
    size="sm"
    icon={app.prefs.effects ? "volume-on" : "volume-off"}
    label={app.prefs.effects ? t("prefs.soundOn") : t("prefs.soundOff")}
    active={app.prefs.effects}
    onclick={() => app.setPref("effects", !app.prefs.effects)}
  />
  <span class="ml-1.5 flex items-center gap-1.5 border-l border-border pl-1.5">
    <IconButton
      size="sm"
      icon="zoom-out"
      label={t("prefs.zoomOut")}
      disabled={app.prefs.zoom <= zoomMin}
      onclick={() => app.zoomBy(-1)}
    />
    <span class="w-10 text-center text-xs font-semibold tabular-nums text-muted-foreground">
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
