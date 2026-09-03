<script lang="ts">
  import { zoomMax, zoomMin, type Theme } from "../../core/prefs";
  import { app } from "../../state.svelte";
  import Chip from "../../ui/Chip.svelte";
  import Icon from "../../ui/Icon.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import Switch from "../../ui/Switch.svelte";

  // Full screen settings sheet, shown on a phone.

  let { onclose }: { onclose: () => void } = $props();

  const themes: { value: Theme; label: string }[] = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" }
  ];

  function keydown(event: KeyboardEvent): void {
    if (event.key === "Escape") onclose();
  }
</script>

<svelte:window onkeydown={keydown} />

<div
  class="fixed inset-0 z-50 flex flex-col bg-background pt-[env(safe-area-inset-top,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
  role="dialog"
  aria-modal="true"
  aria-label="Settings"
>
  <header class="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
    <span class="text-h4 font-bold">Settings</span>
    <IconButton icon="close" label="Close settings" onclick={onclose} />
  </header>

  <div
    class="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]"
  >
    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Theme
      </span>
      <div class="grid grid-cols-3 gap-2">
        {#each themes as theme (theme.value)}
          <Chip
            size="sm"
            class="w-full"
            disabled={app.prefs.contrast}
            active={!app.prefs.contrast && app.prefs.theme === theme.value}
            onclick={() => app.setPref("theme", theme.value)}
          >
            {theme.label}
          </Chip>
        {/each}
      </div>
      <Switch
        label="High contrast"
        hint="Fixed black and white palette, overrides the theme"
        checked={app.prefs.contrast}
        onchange={(value) => app.setPref("contrast", value)}
      />
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Zoom
      </span>
      <div
        class="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3"
      >
        <span class="flex flex-col gap-0.5">
          <span class="text-sm font-semibold leading-tight">Scale</span>
          <span class="text-xs leading-snug text-muted-foreground">
            Sizes every part of the app together
          </span>
        </span>
        <span class="flex shrink-0 items-center gap-2">
          <IconButton
            size="sm"
            icon="zoom-out"
            label="Zoom out"
            disabled={app.prefs.zoom <= zoomMin}
            onclick={() => app.zoomBy(-1)}
          />
          <span class="w-12 text-center text-sm font-semibold tabular-nums">
            {Math.round(app.prefs.zoom * 100)}%
          </span>
          <IconButton
            size="sm"
            icon="zoom-in"
            label="Zoom in"
            disabled={app.prefs.zoom >= zoomMax}
            onclick={() => app.zoomBy(1)}
          />
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Sound
      </span>
      <Switch
        label="Sound effects"
        hint="Clicks and answer feedback"
        checked={app.prefs.effects}
        onchange={(value) => app.setPref("effects", value)}
      />
    </div>

    <p class="flex items-center gap-2 text-xs text-muted-foreground">
      <Icon name="sliders" class="size-4 shrink-0" />
      These stay set between runs.
    </p>
  </div>
</div>
