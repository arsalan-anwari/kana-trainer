<script lang="ts">
  import { kanaById } from "../../core/kana";
  import type { Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import SoundChoice from "./SoundChoice.svelte";
  import { choiceState } from "./choiceState";
  import { t } from "../../i18n.svelte";
  import { Button, roving, viewport } from "kaizen-ui";

  let { question, split = false }: { question: Question; split?: boolean } = $props();

  const rows = $derived(
    question.choices.map((choice, index) => ({
      choice,
      slot: index + 1,
      audio: kanaById(choice.kanaId)?.audio ?? null
    }))
  );
</script>

<div class="flex w-full max-w-xl flex-col gap-3">
  <div use:roving class="grid gap-2 sm:gap-3 {split ? 'grid-cols-2' : 'grid-cols-1'}">
    {#each rows as row (row.choice.kanaId)}
      {#if row.audio !== null}
        <SoundChoice
          slot={row.slot}
          {split}
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
    size={split ? "lg" : "xl"}
    variant="brand"
    full
    silent
    disabled={app.phase !== "answering" || app.staged === null}
    onclick={() => app.submitStaged()}
  >
    {t("quiz.check")}
  </Button>
  {#if !viewport.short}
    <p class="text-center text-xs text-muted-foreground">
      {t(app.phase === "answering" ? "quiz.soundHint" : "quiz.soundCompare")}
    </p>
  {/if}
</div>
