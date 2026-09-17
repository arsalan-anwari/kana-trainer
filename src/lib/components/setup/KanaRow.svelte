<script lang="ts">
  import { glyph, type Row, type Script } from "../../core/kana";
  import { rowLabel } from "../../labels";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { Chip, Glyph, RowBar, roving, viewport } from "kaizen-ui";

  let {
    row,
    script,
    selected
  }: { row: Row; script: Script; selected: Set<string> } = $props();

  const taken = $derived(row.kana.filter((kana) => selected.has(kana.id)).length);
  const complete = $derived(taken === row.kana.length);

  // Matches the Chip md min width so digraph chips never outgrow their cell.
  const tracks = "repeat(auto-fill, minmax(3.75rem, 1fr))";
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
        <Glyph text={glyph(kana, script)} class="text-base" />
        <span class="text-[0.625rem] font-medium opacity-70">{kana.romaji}</span>
      </span>
    </Chip>
  {/each}
{/snippet}

{#if viewport.wide}
  <div class="flex items-center gap-2 sm:gap-3">
    <button
      type="button"
      class="h-10 w-16 shrink-0 cursor-pointer rounded-lg border-2 px-1 text-[0.6875rem] font-bold transition-colors {complete
        ? 'border-selected bg-selected text-background'
        : 'border-border bg-surface text-muted-foreground hover:bg-accent'}"
      onclick={() => app.toggleRow(row.id)}
    >
      {rowLabel(row)}
    </button>
    <div use:roving class="grid min-w-0 flex-1 gap-1.5 sm:gap-2" style="grid-template-columns: {tracks}">
      {@render chips()}
    </div>
  </div>
{:else}
  <RowBar
    label={rowLabel(row)}
    hint="{taken}/{row.kana.length}"
    active={complete}
    expandLabel={t("common.show", { label: rowLabel(row) })}
    collapseLabel={t("common.hide", { label: rowLabel(row) })}
    onpress={() => app.toggleRow(row.id)}
  >
    <div use:roving class="grid gap-1.5" style="grid-template-columns: {tracks}">
      {@render chips()}
    </div>
  </RowBar>
{/if}
