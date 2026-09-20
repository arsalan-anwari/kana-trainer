<script lang="ts">
  import type { Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { Button, TextField, viewport } from "kaizen-ui";

  let { question, split = false }: { question: Question; split?: boolean } = $props();

  const placeholder = $derived(
    app.settings.format === "audio-text"
      ? t("quiz.typing.either")
      : question.answer === "kana"
        ? t("quiz.typing.kana")
        : t("quiz.typing.romaji")
  );

  const tone = $derived(
    app.phase === "answering" ? "idle" : app.lastCorrect ? "correct" : "wrong"
  );
</script>

<div class="flex w-full max-w-md gap-3 {split ? 'items-center' : 'flex-col'}">
  <div class={split ? "min-w-0 flex-1" : "contents"}>
    <TextField
      bind:value={app.typed}
      big={!viewport.short}
      focusOnMount
      {placeholder}
      {tone}
      disabled={app.phase !== "answering"}
      onenter={() => app.submitTyped()}
    />
  </div>
  <Button
    size={viewport.short ? "md" : "lg"}
    variant="brand"
    full={!split}
    silent
    disabled={app.phase !== "answering" || app.typed.trim() === ""}
    onclick={() => app.submitTyped()}
  >
    {t("quiz.check")}
  </Button>
</div>
