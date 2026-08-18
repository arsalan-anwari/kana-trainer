<script lang="ts">
  import { baseRows, dakutenRows, glyph, type Row } from "../core/kana";
  import { app } from "../state.svelte";
  import Button from "../ui/Button.svelte";
  import Chip from "../ui/Chip.svelte";

  const selected = $derived(new Set(app.settings.selection));
  const script = $derived(app.settings.scripts.includes("hiragana") ? "hiragana" : "katakana");
  const shownRows = $derived(
    app.settings.includeDakuten ? [...baseRows, ...dakutenRows] : baseRows
  );

  function rowState(row: Row): "all" | "some" | "none" {
    const count = row.kana.filter((kana) => selected.has(kana.id)).length;
    if (count === 0) return "none";
    return count === row.kana.length ? "all" : "some";
  }

  function selectAll(): void {
    app.setSelection(shownRows.flatMap((row) => row.kana.map((kana) => kana.id)));
  }

  function selectNone(): void {
    app.setSelection([]);
  }

  function selectVowels(): void {
    app.setSelection(baseRows[0].kana.map((kana) => kana.id));
  }

  function selectWeak(): void {
    const ids = app.weakSelection();
    if (ids.length === 0) {
      app.message = "No saved mistakes yet, finish a run first.";
      return;
    }
    app.setSelection(ids);
    app.message = `Loaded ${ids.length} characters you missed before.`;
  }
</script>

<div class="flex h-full min-h-0 flex-col gap-4">
  <div class="flex flex-wrap items-center gap-2">
    <Button size="sm" variant="outline" onclick={selectAll}>Select all</Button>
    <Button size="sm" variant="outline" onclick={selectNone}>Clear</Button>
    <Button size="sm" variant="outline" onclick={selectVowels}>Vowels only</Button>
    <Button size="sm" variant="outline" onclick={selectWeak}>My weak spots</Button>
  </div>

  <div class="scroll-area -mr-2 flex-1 pr-2">
    <div class="flex flex-col gap-3">
      {#each shownRows as row (row.id)}
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="h-10 w-12 shrink-0 cursor-pointer rounded-lg border text-xs font-bold transition-colors hover:bg-accent {rowState(
              row
            ) === 'all'
              ? 'border-brand bg-brand/15 text-foreground'
              : 'border-border bg-background text-muted-foreground'}"
            onclick={() => app.toggleRow(row.id)}
          >
            {row.label}
          </button>
          <div class="grid min-w-0 flex-1 grid-cols-5 gap-2">
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
      {/each}
    </div>
  </div>
</div>
