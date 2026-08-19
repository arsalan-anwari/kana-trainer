<script lang="ts">
  import { summarize, type Report } from "../../core/report";
  import { answerStyleLabel, formatLabel } from "../../core/settings";
  import Badge from "../../ui/Badge.svelte";
  import Button from "../../ui/Button.svelte";

  let {
    report,
    picked,
    ontoggle,
    onsave,
    onremove
  }: {
    report: Report;
    picked: boolean;
    ontoggle: () => void;
    onsave: () => void;
    onremove: () => void;
  } = $props();

  const stats = $derived(summarize(report.answers));
</script>

<div
  class="flex items-center gap-3 rounded-lg border p-3 transition-colors {picked
    ? 'border-foreground bg-foreground/5'
    : 'border-border bg-surface'}"
>
  <button
    type="button"
    class="flex flex-1 cursor-pointer flex-col items-start gap-1 text-left"
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
  <div class="flex shrink-0 flex-col gap-1">
    <Button size="sm" variant="ghost" onclick={onsave}>Save</Button>
    <Button size="sm" variant="ghost" onclick={onremove}>Delete</Button>
  </div>
</div>
