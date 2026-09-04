<script lang="ts">
  import { groupInScript, rows } from "../../core/kana";
  import { groupEnabled } from "../../core/settings";
  import { app } from "../../state.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import KanaRow from "./KanaRow.svelte";
  import PresetPicker from "./PresetPicker.svelte";
  import ScriptTabs from "./ScriptTabs.svelte";

  const selected = $derived(new Set(app.selection));
  const shownRows = $derived(
    rows.filter(
      (row) =>
        groupEnabled(app.settings, row.group) && groupInScript(row.group, app.pickerScript)
    )
  );

  function selectAll(): void {
    app.setSelection(shownRows.flatMap((row) => row.kana.map((kana) => kana.id)));
  }
</script>

<div class="flex flex-col gap-4">
  <ScriptTabs />

  <div class="flex flex-wrap items-center gap-2">
    <IconButton icon="select-all" size="sm" label="Select all" onclick={selectAll} />
    <IconButton
      icon="select-none"
      size="sm"
      label="Clear"
      onclick={() => app.setSelection([])}
    />
    <PresetPicker />
  </div>

  <div class="flex flex-col gap-2 sm:gap-3">
    {#each shownRows as row (row.id)}
      <KanaRow {row} script={app.pickerScript} {selected} />
    {/each}
  </div>
</div>
