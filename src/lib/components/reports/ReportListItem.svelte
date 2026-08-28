<script lang="ts">
  import { summarize, type Report } from "../../core/report";
  import { answerStyleLabel, formatLabel } from "../../core/settings";
  import Badge from "../../ui/Badge.svelte";

  let {
    report,
    picked,
    ontoggle
  }: {
    report: Report;
    picked: boolean;
    ontoggle: () => void;
  } = $props();

  const stats = $derived(summarize(report.answers));
</script>

<button
  type="button"
  aria-pressed={picked}
  class="flex w-full cursor-pointer flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {picked
    ? 'border-selected bg-selected-soft'
    : 'border-border bg-surface hover:bg-accent'}"
  onclick={ontoggle}
>
  <span class="text-sm font-semibold">{new Date(report.createdAt).toLocaleString()}</span>
  <span class="text-xs text-muted-foreground">
    {stats.correct}/{stats.total} correct, {Math.round(stats.accuracy * 100)}%
  </span>
  <div class="flex flex-wrap gap-1">
    <Badge tone="outline">{formatLabel(report.settings.format)}</Badge>
    <Badge tone="outline">{answerStyleLabel(report.settings.answerStyle)}</Badge>
  </div>
</button>
