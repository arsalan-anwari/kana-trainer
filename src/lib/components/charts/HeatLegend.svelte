<script lang="ts">
  import { heatColor } from "kaizen-ui";
  import { masteryLabel, masteryLevels } from "../../core/report";

  let { class: className = "" }: { class?: string } = $props();

  const marks: Record<string, number> = {
    new: 0,
    shaky: 0.2,
    learning: 0.48,
    steady: 0.7,
    mastered: 0.95
  };
</script>

<div class="flex flex-wrap items-center gap-x-3 gap-y-1 {className}">
  {#each masteryLevels as level (level)}
    <span class="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
      <span
        class="size-2 rounded-full border border-border"
        style="background: {level === 'new' ? 'var(--color-secondary)' : heatColor(marks[level])}"
        aria-hidden="true"
      ></span>
      {masteryLabel(level)}
    </span>
  {/each}
</div>
