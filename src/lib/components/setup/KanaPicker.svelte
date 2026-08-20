<script lang="ts">
  import { rows, seionRows } from "../../core/kana";
  import { groupEnabled } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import KanaRow from "./KanaRow.svelte";

  const selected = $derived(new Set(app.settings.selection));
  const script = $derived(
    app.settings.scripts.includes("hiragana") ? "hiragana" : "katakana"
  );
  const shownRows = $derived(rows.filter((row) => groupEnabled(app.settings, row.group)));

  function selectAll(): void {
    app.setSelection(shownRows.flatMap((row) => row.kana.map((kana) => kana.id)));
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

<div class="flex flex-col gap-4">
  <div class="flex flex-wrap items-center gap-2">
    <Button size="sm" variant="outline" onclick={selectAll}>Select all</Button>
    <Button size="sm" variant="outline" onclick={() => app.setSelection([])}>Clear</Button>
    <Button
      size="sm"
      variant="outline"
      onclick={() => app.setSelection(seionRows[0].kana.map((kana) => kana.id))}
    >
      Vowels only
    </Button>
    <Button size="sm" variant="outline" onclick={selectWeak}>My weak spots</Button>
  </div>

  <div class="flex flex-col gap-2 sm:gap-3">
    {#each shownRows as row (row.id)}
      <KanaRow {row} {script} {selected} />
    {/each}
  </div>
</div>
