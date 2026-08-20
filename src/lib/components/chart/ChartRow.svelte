<script lang="ts">
  import type { Row } from "../../core/kana";
  import ChartTile from "./ChartTile.svelte";

  let { row, columns }: { row: Row; columns: number } = $props();
</script>

<div class="flex items-center gap-2 sm:gap-3">
  <span
    class="w-9 shrink-0 text-xs font-bold tracking-tight text-muted-foreground sm:w-12 sm:text-sm"
  >
    {row.label}
  </span>
  <div
    class="grid min-w-0 flex-1 gap-1.5 sm:gap-2"
    style="grid-template-columns: repeat({columns}, minmax(0, 6rem))"
  >
    {#each row.kana as kana (kana.id)}
      <ChartTile {kana} />
    {/each}
  </div>
</div>
