<script lang="ts">
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { IconButton } from "kaizen-ui";
  import type { IconName } from "kaizen-ui";

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

<IconButton
  {size}
  icon={current.icon}
  label={app.prefs.contrast ? t("prefs.themeLocked") : t(`prefs.themeIs.${current.value}`)}
  disabled={app.prefs.contrast}
  onclick={cycle}
/>
