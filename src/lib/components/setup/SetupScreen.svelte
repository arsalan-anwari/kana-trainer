<script lang="ts">
  import { app } from "../../state.svelte";
  import AlphabetPicker from "./AlphabetPicker.svelte";
  import AnswerStylePicker from "./AnswerStylePicker.svelte";
  import DirectionPicker from "./DirectionPicker.svelte";
  import FormatPicker from "./FormatPicker.svelte";
  import KanaPicker from "./KanaPicker.svelte";
  import StartPanel from "./StartPanel.svelte";
  import SettingsPanel from "./SettingsPanel.svelte";
  import { t } from "../../i18n.svelte";
  import { Card, Icon } from "kaizen-ui";

  const textOnly = $derived(app.settings.format === "text-text");
</script>

<!-- The character column is sized in rem so it tracks the zoom: exactly enough
     for a whole seion row on one line -- five 3.75rem chips, four 0.5rem gaps,
     the 4rem row button and the card padding. Anything left over goes to the
     settings column, which never needed the room it had. -->
<div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(28.5rem,29rem)]">
  <div class="flex flex-col gap-5">
    <AlphabetPicker />
    <FormatPicker />
    {#if app.settings.format !== "text-audio"}
      <AnswerStylePicker />
    {/if}
    {#if textOnly}
      <DirectionPicker />
    {/if}
    <SettingsPanel />
  </div>

  <div class="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--header-height,0px)+0.75rem)]">
    <Card title={t("setup.characters.title")} description={t("setup.characters.description")}>
      {#snippet icon()}<Icon name="target" class="size-5" />{/snippet}
      <KanaPicker />
    </Card>
    <StartPanel />
  </div>
</div>
