<script lang="ts">
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";

  const themes: { value: "system" | "light" | "dark"; label: string }[] = [
    { value: "system", label: "Auto" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" }
  ];

  const label = $derived(themes.find((theme) => theme.value === app.prefs.theme)?.label ?? "Auto");

  function cycle(): void {
    const index = themes.findIndex((theme) => theme.value === app.prefs.theme);
    app.prefs.theme = themes[(index + 1) % themes.length].value;
    app.applyPrefs();
  }
</script>

<Button size="sm" variant="outline" title="Switch theme" onclick={cycle}>{label}</Button>
