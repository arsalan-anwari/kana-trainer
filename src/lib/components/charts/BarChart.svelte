<script lang="ts">
  import type { StatRow } from "../../core/report";

  let {
    rows,
    limit = 12,
    empty = "No data yet"
  }: { rows: StatRow[]; limit?: number; empty?: string } = $props();

  const shown = $derived(rows.slice(0, limit));

  // picks a bar colour from the accuracy
  function color(accuracy: number): string {
    if (accuracy >= 0.9) return "var(--color-chart-5)";
    if (accuracy >= 0.7) return "var(--color-chart-4)";
    if (accuracy >= 0.5) return "var(--color-chart-3)";
    return "var(--color-danger)";
  }
</script>

{#if shown.length === 0}
  <p class="py-6 text-center text-sm text-muted-foreground">{empty}</p>
{:else}
  <div class="flex flex-col gap-2">
    {#each shown as row (row.key)}
      <div class="flex items-center gap-2 sm:gap-3">
        <span class="w-16 shrink-0 truncate text-sm font-semibold sm:w-24">
          <span class="kana">{row.label}</span>
        </span>
        <span class="hidden w-14 shrink-0 truncate text-xs text-muted-foreground sm:block">
          {row.sub}
        </span>
        <div class="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            class="h-full rounded-full transition-[width] duration-500"
            style="width: {Math.max(3, Math.round(row.accuracy * 100))}%; background: {color(
              row.accuracy
            )}"
          ></div>
        </div>
        <span
          class="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground sm:w-20"
        >
          {Math.round(row.accuracy * 100)}%
          <span class="hidden sm:inline">of {row.total}</span>
        </span>
      </div>
    {/each}
  </div>
{/if}
