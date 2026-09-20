<script lang="ts">
  import { glyph, kanaById } from "../../core/kana";
  import type { Choice, Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import ChoiceTile from "./ChoiceTile.svelte";
  import { choiceState } from "./choiceState";
  import { roving } from "kaizen-ui";

  let { question, split = false }: { question: Question; split?: boolean } = $props();

  function label(choice: Choice): string {
    const item = kanaById(choice.kanaId);
    if (item === null || item === undefined) return "";
    if (question.answer === "kana") return glyph(item, choice.script);
    if (question.answer === "romaji") return item.romaji;
    return "";
  }
</script>

<div
  use:roving
  class="grid w-full grid-cols-2 gap-2.5 sm:gap-3 {split
    ? 'max-w-[clamp(11rem,calc(var(--answer-max)+2rem),26rem)]'
    : 'max-w-[min(17rem,33dvh)] sm:max-w-md'}"
>
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
