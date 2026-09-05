<script lang="ts">
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import OptionCard from "../../ui/OptionCard.svelte";
  import { t } from "../../i18n.svelte";

  const audioToText = $derived(app.settings.format === "audio-text");
</script>

<Card title={t("setup.answerStyle.title")} description={t("setup.answerStyle.description")}>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <OptionCard
      label={t("common.answerStyle.choice")}
      hint={t(audioToText ? "setup.answerStyle.choiceAudio" : "setup.answerStyle.choice")}
      active={app.settings.answerStyle === "choice"}
      onclick={() => app.updateSettings({ answerStyle: "choice" })}
    />
    <OptionCard
      label={t("common.answerStyle.typing")}
      hint={t(audioToText ? "setup.answerStyle.typingAudio" : "setup.answerStyle.typing")}
      active={app.settings.answerStyle === "typing"}
      onclick={() => app.updateSettings({ answerStyle: "typing" })}
    />
  </div>
</Card>
