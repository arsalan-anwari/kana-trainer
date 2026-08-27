<script lang="ts">
  import { kanaById } from "../../core/kana";
  import type { Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import SoundChoice from "./SoundChoice.svelte";
  import { choiceState } from "./choiceState";

  /**
   * The text to audio answer: four sounds stacked in one column, played and
   * picked one at a time, then committed with the check button below them.
   */

  let { question }: { question: Question } = $props();

  const rows = $derived(
    question.choices.map((choice, index) => ({
      choice,
      slot: index + 1,
      audio: kanaById(choice.kanaId)?.audio ?? null
    }))
  );
</script>

<div class="flex w-full max-w-xl flex-col gap-3">
  <div class="grid grid-cols-1 gap-2 sm:gap-3">
    {#each rows as row (row.choice.kanaId)}
      {#if row.audio !== null}
        <SoundChoice
          slot={row.slot}
          audio={row.audio}
          state={choiceState(question, row.choice, app.phase, app.picked, app.staged)}
          disabled={app.phase !== "answering"}
          onpick={() => app.stageChoice(row.choice)}
        />
      {/if}
    {/each}
  </div>

  <Button
    size="xl"
    variant="brand"
    full
    silent
    disabled={app.phase !== "answering" || app.staged === null}
    onclick={() => app.submitStaged()}
  >
    Check
  </Button>
  <p class="text-center text-xs text-muted-foreground">
    Tap a sound to hear it and pick it, then check your answer.
  </p>
</div>
