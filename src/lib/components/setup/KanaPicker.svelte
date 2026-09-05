<script lang="ts">
  import { groupInScript, rows } from "../../core/kana";
  import { groupEnabled } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import Icon from "../../ui/Icon.svelte";
  import KanaRow from "./KanaRow.svelte";
  import PresetPicker from "./PresetPicker.svelte";
  import ScriptTabs from "./ScriptTabs.svelte";
  import { t } from "../../i18n.svelte";

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
  <div class="flex flex-wrap items-center gap-2">
    <PresetPicker />
  </div>

  <ScriptTabs />

  <div class="flex flex-wrap items-center gap-2">
    <Button size="sm" variant="outline" onclick={selectAll}>
      <Icon name="select-all" />
      {t("setup.characters.selectAll")}
    </Button>
    <Button size="sm" variant="outline" onclick={() => app.setSelection([])}>
      <Icon name="select-none" />
      {t("setup.characters.clear")}
    </Button>
  </div>

  <div class="flex flex-col gap-2 sm:gap-3">
    {#each shownRows as row (row.id)}
      <KanaRow {row} script={app.pickerScript} {selected} />
    {/each}
  </div>
</div>
