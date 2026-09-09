<script lang="ts">
  import { kanaById } from "../../core/kana";
  import type { Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import SoundChoice from "./SoundChoice.svelte";
  import { choiceState } from "./choiceState";
  import { t } from "../../i18n.svelte";
  import { Button } from "kaizen-ui";

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
          disabled={app.phase === "done"}
          onpick={() =>
            app.phase === "answering" ? app.stageChoice(row.choice) : app.playChoice(row.choice)}
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
    {t("quiz.check")}
  </Button>
  <p class="text-center text-xs text-muted-foreground">
    {t(app.phase === "answering" ? "quiz.soundHint" : "quiz.soundCompare")}
  </p>
</div>
