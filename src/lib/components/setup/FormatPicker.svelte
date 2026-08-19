<script lang="ts">
  import type { Format } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import OptionCard from "../../ui/OptionCard.svelte";

  const all: { value: Format; label: string; hint: string }[] = [
    { value: "text-text", label: "Text only", hint: "Read a character, answer with text" },
    { value: "audio-text", label: "Audio to text", hint: "Hear a sound, answer with text" },
    { value: "text-audio", label: "Text to audio", hint: "Read a character, pick the sound" }
  ];

  // dakuten characters have no recordings, so audio modes drop out
  const formats = $derived(
    app.settings.includeDakuten ? all.filter((format) => format.value === "text-text") : all
  );
</script>

<Card title="Question format" description="How each question is shown and answered.">
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {#each formats as format (format.value)}
      <OptionCard
        label={format.label}
        hint={format.hint}
        active={app.settings.format === format.value}
        onclick={() => app.updateSettings({ format: format.value })}
      />
    {/each}
  </div>
</Card>
