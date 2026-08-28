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

<!-- width capped against the viewport so a short phone shrinks the tiles -->
<div class="grid w-full max-w-[min(17rem,36dvh)] grid-cols-2 gap-2.5 sm:max-w-md sm:gap-3">
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
