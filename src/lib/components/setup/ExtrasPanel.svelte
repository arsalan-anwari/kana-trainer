<script lang="ts">
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import Switch from "../../ui/Switch.svelte";

  let { showDakuten = false }: { showDakuten?: boolean } = $props();
</script>

<Card title="Extras" description="Dakuten characters and sound.">
  <div class="flex flex-col gap-3">
    {#if showDakuten}
      <Switch
        label="Include dakuten and handakuten"
        hint="Disables all audio modes"
        checked={app.settings.includeDakuten}
        onchange={(value) => app.setDakuten(value)}
      />
    {/if}
    <Switch
      label="Sound effects"
      hint="Clicks and answer feedback"
      checked={app.prefs.effects}
      onchange={(value) => {
        app.prefs.effects = value;
        app.applyPrefs();
      }}
    />
  </div>
</Card>
