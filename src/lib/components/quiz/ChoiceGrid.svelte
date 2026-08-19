<script lang="ts">
  import { glyph, kanaById } from "../../core/kana";
  import type { Choice, Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import ChoiceTile from "./ChoiceTile.svelte";
  import { choiceState } from "./choiceState";

  let { question }: { question: Question } = $props();

  function label(choice: Choice): string {
    const item = kanaById(choice.kanaId);
    if (item === null || item === undefined) return "";
    if (question.answer === "kana") return glyph(item, choice.script);
    if (question.answer === "romaji") return item.romaji;
    return "";
  }
</script>

<div class="grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
  {#each question.choices as choice, index (choice.kanaId)}
    <ChoiceTile
      slot={index + 1}
      label={label(choice)}
      kana={question.answer === "kana"}
      state={choiceState(question, choice, app.phase, app.picked, app.staged)}
      disabled={app.phase !== "answering"}
      onpick={() => app.answerChoice(choice)}
    />
  {/each}
</div>
