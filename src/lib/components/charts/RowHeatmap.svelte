<script lang="ts">
  import { heatColor, heatFill } from "kaizen-ui";
  import { masteryLabel, type HeatRow } from "../../core/report";
  import HeatLegend from "./HeatLegend.svelte";
  import { t } from "../../i18n.svelte";

  let { heat }: { heat: HeatRow[] } = $props();
</script>

{#if heat.length === 0}
  <p class="py-6 text-center text-sm text-muted-foreground">{t("reports.rows.empty")}</p>
{:else}
  <div class="flex flex-col gap-3">
    
    <div class="flex max-w-3xl flex-col gap-1.5">
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
                class="grid h-7 min-w-7 place-items-center rounded-lg border-2 border-border px-1 sm:h-8 sm:min-w-8"
                class:opacity-35={cell.total === 0}
                style={cell.total === 0 ? "" : `background: ${heatFill(cell.strength, 34)}`}
                title={cell.total === 0
                  ? t("reports.tip.never", { romaji: cell.romaji })
                  : t("reports.tip.strength", {
                      romaji: cell.romaji,
                      correct: cell.correct,
                      total: cell.total,
                      percent: Math.round(cell.strength * 100)
                    })}
              >
                <span class="kana whitespace-nowrap text-sm leading-none">{cell.glyph}</span>
              </span>
            {/each}
          </div>
          
          <span
            class="w-12 shrink-0 text-right text-xs font-bold leading-none tabular-nums"
            style="color: {heatColor(row.strength)}"
            title="{masteryLabel(row.mastery)} — {t('reports.tip.rowRight', {
              correct: row.correct,
              total: row.total
            })}"
          >
            {row.correct}/{row.total}
          </span>
        </div>
      {/each}
    </div>
    <HeatLegend />
  </div>
{/if}
