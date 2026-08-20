<script lang="ts">
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import Progress from "../../ui/Progress.svelte";

  const totalLabel = $derived.by(() => {
    if (app.totalRemaining === null) return null;
    const seconds = Math.ceil(app.totalRemaining / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
  });
</script>

<div class="flex flex-col gap-3">
  <div class="flex items-center gap-3">
    <Button size="sm" variant="ghost" onclick={() => app.askQuit()}>Quit</Button>
    <Progress value={app.progress} class="flex-1" />
    <span class="shrink-0 text-sm font-semibold tabular-nums">
      {app.index + 1} / {app.questions.length}
    </span>
  </div>
  <div class="flex flex-wrap items-center gap-2 text-sm">
    <span class="rounded-md bg-secondary px-3 py-1 font-semibold">{app.score} correct</span>
    {#if totalLabel !== null}
      <span
        class="rounded-md px-3 py-1 font-semibold tabular-nums {(app.totalRemaining ?? 0) < 15000
          ? 'bg-danger-soft text-danger'
          : 'bg-secondary'}"
      >
        {totalLabel} left
      </span>
    {/if}
  </div>
</div>
