<script lang="ts">
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import AlphabetPicker from "./AlphabetPicker.svelte";
  import AnswerStylePicker from "./AnswerStylePicker.svelte";
  import DirectionPicker from "./DirectionPicker.svelte";
  import ExtrasPanel from "./ExtrasPanel.svelte";
  import FormatPicker from "./FormatPicker.svelte";
  import KanaPicker from "./KanaPicker.svelte";
  import StartPanel from "./StartPanel.svelte";
  import TimeTrialPanel from "./TimeTrialPanel.svelte";

  const textOnly = $derived(app.settings.format === "text-text");
</script>

<div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
  <div class="flex flex-col gap-5">
    <AlphabetPicker />
    <FormatPicker />
    {#if app.settings.format !== "text-audio"}
      <AnswerStylePicker />
    {/if}
    {#if textOnly}
      <DirectionPicker />
    {/if}
    <ExtrasPanel />
    <TimeTrialPanel />
  </div>

  <div class="flex flex-col gap-4 lg:sticky lg:top-6">
    <Card title="Characters" description="Tap a row label to take the whole row.">
      <KanaPicker />
    </Card>
    <StartPanel />
  </div>
</div>
