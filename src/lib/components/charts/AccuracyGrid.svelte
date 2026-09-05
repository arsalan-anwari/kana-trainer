<script lang="ts">
  import type { StatRow } from "../../core/report";
  import { heatColor, heatFill } from "./heat";
  import HeatLegend from "./HeatLegend.svelte";
  import { t } from "../../i18n.svelte";

  // The weakest characters as tiles, tinted from red to green by accuracy. The
  // bar under each tile is how much of the shown work that character carried,
  // so a 0% tile seen twice cannot be mistaken for one seen forty times.
  // The grid packs itself, which is what keeps it readable from a phone to a
  // desktop without a breakpoint per size.

  let {
    rows,
    limit = 12
  }: { rows: StatRow[]; limit?: number } = $props();

  const shown = $derived(rows.slice(0, limit));
  const busiest = $derived(Math.max(1, ...shown.map((row) => row.total)));
</script>

{#if shown.length === 0}
  <p class="py-6 text-center text-sm text-muted-foreground">{t("reports.noData")}</p>
{:else}
  <div class="flex flex-col gap-3">
    <div class="grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-2">
      {#each shown as row (row.key)}
        <div
          class="flex flex-col items-center gap-1 rounded-lg border border-border bg-secondary p-2"
          style="background: {heatFill(row.accuracy)}"
          title={t("reports.tip.cell", { sub: row.sub, correct: row.correct, total: row.total })}
        >
          <span class="kana text-h4 font-semibold leading-none">{row.label}</span>
          <span class="w-full truncate text-center text-[0.625rem] leading-none text-muted-foreground">
            {row.sub}
          </span>
          <span
            class="text-xs font-bold leading-none tabular-nums"
            style="color: {heatColor(row.accuracy)}"
          >
            {Math.round(row.accuracy * 100)}%
          </span>
          <div class="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              class="h-full rounded-full bg-foreground/40"
              style="width: {Math.max(6, Math.round((row.total / busiest) * 100))}%"
            ></div>
          </div>
        </div>
      {/each}
    </div>
    <HeatLegend />
  </div>
{/if}
