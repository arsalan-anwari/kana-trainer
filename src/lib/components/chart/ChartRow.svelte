<script lang="ts">
  import type { Row } from "../../core/kana";
  import { rowLabel } from "../../labels";
  import { t } from "../../i18n.svelte";
  import { viewport } from "../../viewport.svelte";
  import RowBar from "../../ui/RowBar.svelte";
  import ChartTile from "./ChartTile.svelte";

  let { row }: { row: Row } = $props();

  // Tracks are sized in rem, so raising the zoom drops columns per row instead
  // of squeezing the tiles until the text stops fitting. auto-fill, not
  // auto-fit, so a short row keeps its empty tracks and stays aligned with the
  // rows above and below it.
  const tracks = "repeat(auto-fill, minmax(4.25rem, 1fr))";
</script>

{#snippet tiles()}
  {#each row.kana as kana (kana.id)}
    <ChartTile {kana} />
  {/each}
{/snippet}

{#if viewport.wide}
  <div class="flex items-center gap-3">
    <span class="w-16 shrink-0 text-xs font-bold tracking-tight text-muted-foreground">
      {rowLabel(row)}
    </span>
    <div class="grid min-w-0 flex-1 gap-2" style="grid-template-columns: {tracks}">
      {@render tiles()}
    </div>
  </div>
{:else}
  <RowBar label={rowLabel(row)} hint={t("chart.sounds", { count: row.kana.length })}>
    <!-- as many tiles across as the zoom leaves room for -->
    <div class="grid gap-1.5" style="grid-template-columns: {tracks}">
      {@render tiles()}
    </div>
  </RowBar>
{/if}
