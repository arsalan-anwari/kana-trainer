<script lang="ts">
  import type { Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import TextField from "../../ui/TextField.svelte";
  import { t } from "../../i18n.svelte";

  let { question }: { question: Question } = $props();

  const placeholder = $derived(
    app.settings.format === "audio-text"
      ? t("quiz.typing.either")
      : question.answer === "kana"
        ? t("quiz.typing.kana")
        : t("quiz.typing.romaji")
  );

  // the field carries the verdict until the next question
  const tone = $derived(
    app.phase === "answering" ? "idle" : app.lastCorrect ? "correct" : "wrong"
  );
</script>

<div class="flex w-full max-w-md flex-col gap-3">
  <TextField
    bind:value={app.typed}
    big
    focusOnMount
    {placeholder}
    {tone}
    disabled={app.phase !== "answering"}
    onenter={() => app.submitTyped()}
  />
  <Button
    size="lg"
    variant="brand"
    full
    silent
    disabled={app.phase !== "answering" || app.typed.trim() === ""}
    onclick={() => app.submitTyped()}
  >
    {t("quiz.check")}
  </Button>
</div>
