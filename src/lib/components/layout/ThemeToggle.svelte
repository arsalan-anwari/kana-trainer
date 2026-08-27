<script lang="ts">
  import { app } from "../../state.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import type { IconName } from "../../ui/icons";

  let { size = "sm" }: { size?: "sm" | "md" } = $props();

  const themes: { value: "system" | "light" | "dark"; label: string; icon: IconName }[] = [
    { value: "system", label: "Theme: follow the system", icon: "monitor" },
    { value: "light", label: "Theme: light", icon: "sun" },
    { value: "dark", label: "Theme: dark", icon: "moon" }
  ];

  const current = $derived(themes.find((theme) => theme.value === app.prefs.theme) ?? themes[0]);

  function cycle(): void {
    const index = themes.findIndex((theme) => theme.value === app.prefs.theme);
    app.setPref("theme", themes[(index + 1) % themes.length].value);
  }
</script>

<!-- high contrast is its own palette, so the theme has nothing left to say -->
<IconButton
  {size}
  icon={current.icon}
  label={app.prefs.contrast ? "Theme is fixed by high contrast" : current.label}
  disabled={app.prefs.contrast}
  onclick={cycle}
/>
