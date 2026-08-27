<script lang="ts">
  import type { Row } from "../../core/kana";
  import { viewport } from "../../viewport.svelte";
  import RowBar from "../../ui/RowBar.svelte";
  import ChartTile from "./ChartTile.svelte";

  let { row, columns }: { row: Row; columns: number } = $props();
</script>

{#snippet tiles()}
  {#each row.kana as kana (kana.id)}
    <ChartTile {kana} />
  {/each}
{/snippet}

{#if viewport.wide}
  <div class="flex items-center gap-3">
    <span class="w-16 shrink-0 text-xs font-bold tracking-tight text-muted-foreground">
      {row.label}
    </span>
    <div
      class="grid min-w-0 flex-1 gap-2"
      style="grid-template-columns: repeat({columns}, minmax(0, 6rem))"
    >
      {@render tiles()}
    </div>
  </div>
{:else}
  <RowBar label={row.label} hint="{row.kana.length} sounds">
    <!-- three across on a phone, any tighter and the tiles stop being tappable -->
    <div class="grid grid-cols-3 gap-1.5">
      {@render tiles()}
    </div>
  </RowBar>
{/if}
