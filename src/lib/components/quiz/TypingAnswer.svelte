<script lang="ts">
  import type { Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import TextField from "../../ui/TextField.svelte";

  let { question }: { question: Question } = $props();

  const placeholder = $derived(
    app.settings.format === "audio-text"
      ? "Type the kana or romaji"
      : question.answer === "kana"
        ? "Type the kana"
        : "Type the romaji"
  );
</script>

<div class="flex w-full max-w-md flex-col gap-3">
  <TextField
    bind:value={app.typed}
    big
    focusOnMount
    {placeholder}
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
    Check
  </Button>
</div>
