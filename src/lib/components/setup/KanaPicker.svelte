<script lang="ts">
  import { rows } from "../../core/kana";
  import { groupEnabled } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import KanaRow from "./KanaRow.svelte";
  import ScriptTabs from "./ScriptTabs.svelte";

  const selected = $derived(new Set(app.selection));
  const shownRows = $derived(rows.filter((row) => groupEnabled(app.settings, row.group)));

  function selectAll(): void {
    app.setSelection(shownRows.flatMap((row) => row.kana.map((kana) => kana.id)));
  }
</script>

<div class="flex flex-col gap-4">
  <ScriptTabs />

  <div class="flex flex-wrap items-center gap-2">
    <Button size="sm" variant="outline" onclick={selectAll}>Select all</Button>
    <Button size="sm" variant="outline" onclick={() => app.setSelection([])}>Clear</Button>
  </div>

  <div class="flex flex-col gap-2 sm:gap-3">
    {#each shownRows as row (row.id)}
      <KanaRow {row} script={app.pickerScript} {selected} />
    {/each}
  </div>
</div>
