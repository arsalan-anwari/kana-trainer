<script lang="ts">
  import type { HeatRow } from "../../core/report";
  import { heatColor, heatFill } from "./heat";
  import HeatLegend from "./HeatLegend.svelte";
  import { t } from "../../i18n.svelte";

  // The kana table, tinted. Each line is a row of the gojuon with its characters
  // still in their usual places, so the shape of what is weak is read the same
  // way the alphabet was learnt. Cells wrap, which is all the narrow widths need.

  let { heat }: { heat: HeatRow[] } = $props();
</script>

{#if heat.length === 0}
  <p class="py-6 text-center text-sm text-muted-foreground">{t("reports.rows.empty")}</p>
{:else}
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1.5">
      {#each heat as row (row.id)}
        <div class="flex items-center gap-2">
          <span
            class="w-11 shrink-0 truncate text-[0.625rem] font-bold uppercase tracking-wide text-muted-foreground sm:w-16"
          >
            {row.label}
          </span>
          <div class="flex min-w-0 flex-1 flex-wrap gap-1">
            {#each row.cells as cell (cell.key)}
              <span
                class="grid size-7 place-items-center rounded-md border border-border sm:size-8"
                class:opacity-35={cell.total === 0}
                style={cell.total === 0 ? "" : `background: ${heatFill(cell.accuracy, 30)}`}
                title={cell.total === 0
                  ? t("reports.tip.never", { romaji: cell.romaji })
                  : t("reports.tip.right", {
                      romaji: cell.romaji,
                      correct: cell.correct,
                      total: cell.total
                    })}
              >
                <span class="kana text-sm leading-none">{cell.glyph}</span>
              </span>
            {/each}
          </div>
          <span
            class="w-8 shrink-0 text-right text-xs font-bold leading-none tabular-nums"
            style="color: {heatColor(row.accuracy)}"
            title={t("reports.tip.rowRight", { correct: row.correct, total: row.total })}
          >
            {Math.round(row.accuracy * 100)}%
          </span>
        </div>
      {/each}
    </div>
    <HeatLegend />
  </div>
{/if}
