<script lang="ts">
  import { glyph, type Row, type Script } from "../../core/kana";
  import { app } from "../../state.svelte";
  import Chip from "../../ui/Chip.svelte";

  let {
    row,
    script,
    selected
  }: { row: Row; script: Script; selected: Set<string> } = $props();

  const complete = $derived(row.kana.every((kana) => selected.has(kana.id)));
</script>

<div class="flex items-center gap-2 sm:gap-3">
  <button
    type="button"
    class="h-10 w-10 shrink-0 cursor-pointer rounded-lg border text-xs font-bold transition-colors sm:w-12 {complete
      ? 'border-foreground bg-foreground text-background'
      : 'border-border bg-surface text-muted-foreground hover:bg-accent'}"
    onclick={() => app.toggleRow(row.id)}
  >
    {row.label}
  </button>
  <div class="grid min-w-0 flex-1 grid-cols-5 gap-1.5 sm:gap-2">
    {#each row.kana as kana (kana.id)}
      <Chip
        class="w-full min-w-0"
        active={selected.has(kana.id)}
        title={kana.romaji}
        onclick={() => app.toggleKana(kana.id)}
      >
        <span class="flex flex-col items-center leading-none">
          <span class="kana text-base">{glyph(kana, script)}</span>
          <span class="text-[10px] font-medium opacity-70">{kana.romaji}</span>
        </span>
      </Chip>
    {/each}
  </div>
</div>
