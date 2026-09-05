<script lang="ts">
  import { app } from "../../state.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import type { IconName } from "../../ui/icons";
  import { t } from "../../i18n.svelte";

  let { size = "sm" }: { size?: "sm" | "md" } = $props();

  const themes: { value: "system" | "light" | "dark"; icon: IconName }[] = [
    { value: "system", icon: "monitor" },
    { value: "light", icon: "sun" },
    { value: "dark", icon: "moon" }
  ];

  const current = $derived(themes.find((theme) => theme.value === app.prefs.theme) ?? themes[0]);

  function cycle(): void {
    const index = themes.findIndex((theme) => theme.value === app.prefs.theme);
    app.setPref("theme", themes[(index + 1) % themes.length].value);
  }
</script>

<!-- disabled while high contrast is on -->
<IconButton
  {size}
  icon={current.icon}
  label={app.prefs.contrast ? t("prefs.themeLocked") : t(`prefs.themeIs.${current.value}`)}
  disabled={app.prefs.contrast}
  onclick={cycle}
/>
