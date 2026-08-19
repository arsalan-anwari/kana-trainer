<script lang="ts">
  import type { Direction } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import OptionCard from "../../ui/OptionCard.svelte";

  const directions: { value: Direction; label: string; hint: string }[] = [
    { value: "kana-romaji", label: "Kana to romaji", hint: "Answer in romaji" },
    { value: "romaji-kana", label: "Romaji to kana", hint: "Answer in kana" },
    { value: "mixed", label: "Mixed", hint: "Both ways at random" }
  ];
</script>

<Card title="Direction" description="Which side you get and which side you answer.">
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {#each directions as direction (direction.value)}
      <OptionCard
        label={direction.label}
        hint={direction.hint}
        active={app.settings.direction === direction.value}
        onclick={() => app.updateSettings({ direction: direction.value })}
      />
    {/each}
  </div>
</Card>
