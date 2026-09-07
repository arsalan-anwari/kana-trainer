<script lang="ts">
  import type { Row } from "../../core/kana";
  import { rowLabel } from "../../labels";
  import { t } from "../../i18n.svelte";
  import ChartTile from "./ChartTile.svelte";
  import { RowBar, TileGrid, viewport } from "kaizen-ui";

  let { row }: { row: Row } = $props();

  // Yoon writes two characters in each script, so its tiles carry twice the
  // sub text of any other row and need the extra width. Tokushon is two
  // characters too, but katakana only, so it fits a square the same as the
  // rest.
  const size = $derived(
    row.kana.some((kana) => [...kana.hira].length > 1 && [...kana.kata].length > 1)
      ? ("extra-wide" as const)
      : ("base" as const)
  );
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
    <TileGrid {size} class="min-w-0 flex-1 gap-2">
      {@render tiles()}
    </TileGrid>
  </div>
{:else}
  <RowBar
    label={rowLabel(row)}
    hint={t("chart.sounds", { count: row.kana.length })}
    expandLabel={t("common.show", { label: rowLabel(row) })}
    collapseLabel={t("common.hide", { label: rowLabel(row) })}
  >
    <TileGrid {size} class="gap-1.5">
      {@render tiles()}
    </TileGrid>
  </RowBar>
{/if}
