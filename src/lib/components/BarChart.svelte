<script lang="ts">
  import type { StatRow } from "../core/report";

  let {
    rows,
    limit = 12,
    empty = "No data yet"
  }: { rows: StatRow[]; limit?: number; empty?: string } = $props();

  const shown = $derived(rows.slice(0, limit));

  function color(accuracy: number): string {
    if (accuracy >= 0.9) return "var(--color-chart-3)";
    if (accuracy >= 0.7) return "var(--color-chart-2)";
    if (accuracy >= 0.5) return "var(--color-chart-1)";
    return "var(--color-danger)";
  }
</script>

{#if shown.length === 0}
  <p class="py-6 text-center text-sm text-muted-foreground">{empty}</p>
{:else}
  <div class="flex flex-col gap-2">
    {#each shown as row (row.key)}
      <div class="flex items-center gap-3">
        <span class="w-24 shrink-0 truncate text-sm font-semibold">
          <span class="kana">{row.label}</span>
        </span>
        <span class="w-14 shrink-0 truncate text-xs text-muted-foreground">{row.sub}</span>
        <div class="h-4 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            class="h-full rounded-full transition-[width] duration-500"
            style="width: {Math.max(3, Math.round(row.accuracy * 100))}%; background: {color(row.accuracy)}"
          ></div>
        </div>
        <span class="w-20 shrink-0 text-right text-xs font-semibold text-muted-foreground">
          {Math.round(row.accuracy * 100)}% of {row.total}
        </span>
      </div>
    {/each}
  </div>
{/if}
