<script lang="ts">
  import { glyph, type Row, type Script } from "../../core/kana";
  import { rowLabel } from "../../labels";
  import { app } from "../../state.svelte";
  import { viewport } from "../../viewport.svelte";
  import Chip from "../../ui/Chip.svelte";
  import RowBar from "../../ui/RowBar.svelte";

  let {
    row,
    script,
    selected
  }: { row: Row; script: Script; selected: Set<string> } = $props();

  const taken = $derived(row.kana.filter((kana) => selected.has(kana.id)).length);
  const complete = $derived(taken === row.kana.length);

  // Tracks in rem, so raising the zoom drops chips per row rather than
  // shrinking them until the character stops fitting. auto-fill keeps the
  // empty tracks so short rows stay lined up with full ones.
  const tracks = "repeat(auto-fill, minmax(3.25rem, 1fr))";
</script>

{#snippet chips()}
  {#each row.kana as kana (kana.id)}
    <Chip
      class="w-full min-w-0"
      active={selected.has(kana.id)}
      title={kana.romaji}
      onclick={() => app.toggleKana(kana.id)}
    >
      <span class="flex flex-col items-center leading-none">
        <span class="kana text-base">{glyph(kana, script)}</span>
        <span class="text-[0.625rem] font-medium opacity-70">{kana.romaji}</span>
      </span>
    </Chip>
  {/each}
{/snippet}

{#if viewport.wide}
  <!-- row label beside its five characters -->
  <div class="flex items-center gap-2 sm:gap-3">
    <button
      type="button"
      class="h-10 w-16 shrink-0 cursor-pointer rounded-lg border px-1 text-[0.6875rem] font-bold transition-colors {complete
        ? 'border-selected bg-selected text-background'
        : 'border-border bg-surface text-muted-foreground hover:bg-accent'}"
      onclick={() => app.toggleRow(row.id)}
    >
      {rowLabel(row)}
    </button>
    <div class="grid min-w-0 flex-1 gap-1.5 sm:gap-2" style="grid-template-columns: {tracks}">
      {@render chips()}
    </div>
  </div>
{:else}
  <RowBar
    label={rowLabel(row)}
    hint="{taken}/{row.kana.length}"
    active={complete}
    onpress={() => app.toggleRow(row.id)}
  >
    <div class="grid gap-1.5" style="grid-template-columns: {tracks}">
      {@render chips()}
    </div>
  </RowBar>
{/if}
