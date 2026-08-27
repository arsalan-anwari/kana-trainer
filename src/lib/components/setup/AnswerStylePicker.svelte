<script lang="ts">
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import OptionCard from "../../ui/OptionCard.svelte";

  const audioToText = $derived(app.settings.format === "audio-text");
</script>

<Card title="Answer style" description="Tap one of four answers or type it yourself.">
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <OptionCard
      label="Multiple choice"
      hint={audioToText ? "Answer choices are always in kana" : "Choose one of 4 options"}
      active={app.settings.answerStyle === "choice"}
      onclick={() => app.updateSettings({ answerStyle: "choice" })}
    />
    <OptionCard
      label="Typing"
      hint={audioToText ? "Accepts kana or romaji" : "Type the romaji or kana"}
      active={app.settings.answerStyle === "typing"}
      onclick={() => app.updateSettings({ answerStyle: "typing" })}
    />
  </div>
</Card>
