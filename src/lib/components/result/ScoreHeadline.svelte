<script lang="ts">
  import type { Report, Summary } from "../../core/report";
  import { scoreTier, tierEmoji, tierHeadline } from "../../core/score";

  let { report, summary }: { report: Report; summary: Summary } = $props();

  const tier = $derived(scoreTier(summary.accuracy, summary.total));
  const headline = $derived(tierHeadline(tier));

  const stats = $derived([
    { value: `${Math.round(summary.accuracy * 100)}%`, label: "accuracy" },
    { value: `${(summary.averageMs / 1000).toFixed(1)}s`, label: "per question" },
    { value: `${summary.timedOut}`, label: "timed out" }
  ]);
</script>

<div
  class="anim-cheer flex flex-col gap-5 rounded-xl border border-border bg-sidebar p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
>
  <div class="flex flex-col gap-1">
    <span class="flex items-center gap-3 text-h1 font-bold leading-tight">
      <span aria-hidden="true">{tierEmoji(tier)}</span>
      {headline}
    </span>
    <span class="text-sm text-muted-foreground">
      {summary.correct} of {summary.total} correct in
      {Math.round(report.durationMs / 1000)} seconds
    </span>
  </div>
  <div class="flex items-center gap-6 sm:gap-8">
    {#each stats as stat (stat.label)}
      <div class="flex flex-col items-start sm:items-center">
        <span class="text-h2 font-bold leading-none tabular-nums sm:text-h1">{stat.value}</span>
        <span class="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</span>
      </div>
    {/each}
  </div>
</div>
