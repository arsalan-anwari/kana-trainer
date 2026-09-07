<script lang="ts">
  import { heatColor, heatFill } from "kaizen-ui";
  import { masteryLabel, type StatRow } from "../../core/report";
  import HeatLegend from "./HeatLegend.svelte";
  import { t } from "../../i18n.svelte";

  // The weakest characters as tiles. Tint, bar and word all read the same
  // strength, so nothing on a tile can contradict anything else on it. How often
  // a character came up is already inside the strength, and is spelled out in
  // the tooltip rather than drawn as a second bar.

  let { rows, limit = 12 }: { rows: StatRow[]; limit?: number } = $props();

  const shown = $derived(rows.slice(0, limit));
</script>

{#if shown.length === 0}
  <p class="py-6 text-center text-sm text-muted-foreground">{t("reports.noData")}</p>
{:else}
  <div class="flex flex-col gap-3">
    <div class="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2">
      {#each shown as row (row.key)}
        <div
          class="flex flex-col items-center gap-1.5 rounded-xl border-2 border-border p-2"
          style="background: {heatFill(row.strength)}"
          title={t("reports.tip.strength", {
            romaji: row.sub,
            correct: row.correct,
            total: row.total,
            percent: Math.round(row.strength * 100)
          })}
        >
          <span class="kana text-h4 font-bold leading-none">{row.label}</span>
          <span class="w-full truncate text-center text-[0.625rem] leading-none text-muted-foreground">
            {row.sub}
          </span>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              class="h-full rounded-full transition-[width] duration-500"
              style="width: {row.strength * 100}%; background: {heatColor(row.strength)}"
            ></div>
          </div>
          <span
            class="w-full truncate text-center text-[0.625rem] font-bold leading-none"
            style="color: {heatColor(row.strength)}"
          >
            {masteryLabel(row.mastery)}
          </span>
        </div>
      {/each}
    </div>
    <HeatLegend />
  </div>
{/if}
