<script lang="ts">
  import { app } from "../../state.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import type { IconName } from "../../ui/icons";

  const themes: { value: "system" | "light" | "dark"; label: string; icon: IconName }[] = [
    { value: "system", label: "Theme: follow the system", icon: "monitor" },
    { value: "light", label: "Theme: light", icon: "sun" },
    { value: "dark", label: "Theme: dark", icon: "moon" }
  ];

  const current = $derived(themes.find((theme) => theme.value === app.prefs.theme) ?? themes[0]);

  function cycle(): void {
    const index = themes.findIndex((theme) => theme.value === app.prefs.theme);
    app.prefs.theme = themes[(index + 1) % themes.length].value;
    app.applyPrefs();
  }
</script>

<IconButton size="sm" icon={current.icon} label={current.label} onclick={cycle} />
