<script lang="ts">
  import { kanaById } from "../../core/kana";
  import { app } from "../../state.svelte";
  import Progress from "../../ui/Progress.svelte";
  import ChoiceGrid from "./ChoiceGrid.svelte";
  import FeedbackPanel from "./FeedbackPanel.svelte";
  import QuestionPrompt from "./QuestionPrompt.svelte";
  import QuizStatusBar from "./QuizStatusBar.svelte";
  import SoundChoiceList from "./SoundChoiceList.svelte";
  import TypingAnswer from "./TypingAnswer.svelte";

  const question = $derived(app.current);
  const kana = $derived(question === null ? null : (kanaById(question.kanaId) ?? null));
  const secondsLeft = $derived(
    app.questionRemaining === null ? null : Math.ceil(app.questionRemaining / 1000)
  );
  const picksSound = $derived(question !== null && question.answer === "audio");

  function keydown(event: KeyboardEvent): void {
    if (question === null) return;

    if (event.key === "Escape") {
      app.quit();
      return;
    }

    if (app.phase === "feedback") {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        app.next();
      }
      return;
    }

    if (event.key === "r") {
      app.replayPrompt();
      return;
    }

    if (app.settings.answerStyle !== "choice") return;

    const slot = Number(event.key);
    if (slot >= 1 && slot <= question.choices.length) {
      const choice = question.choices[slot - 1];
      if (picksSound) app.stageChoice(choice);
      else app.answerChoice(choice);
      return;
    }

    if (picksSound && event.key === "Enter") {
      event.preventDefault();
      app.submitStaged();
    }
  }
</script>

<svelte:window onkeydown={keydown} />

{#if question !== null && kana !== null}
  <div class="flex flex-col gap-6">
    <QuizStatusBar />

    <div class="flex flex-col items-center gap-6 sm:gap-8">
      {#if secondsLeft !== null}
        <div class="w-full max-w-xs">
          <Progress
            value={(app.questionRemaining ?? 0) / (app.settings.perQuestionSeconds * 10)}
            tone={secondsLeft <= 3 ? "danger" : "primary"}
          />
        </div>
      {/if}

      {#key question.index}
        <div class="anim-pop flex w-full flex-col items-center gap-6 sm:gap-8">
          <QuestionPrompt {question} {kana} onreplay={() => app.replayPrompt()} />

          {#if app.settings.answerStyle !== "choice"}
            <TypingAnswer {question} />
          {:else if picksSound}
            <SoundChoiceList {question} />
          {:else}
            <ChoiceGrid {question} />
          {/if}
        </div>
      {/key}

      {#if app.phase === "feedback"}
        <div class="w-full max-w-xl">
          <FeedbackPanel {question} {kana} />
        </div>
      {/if}
    </div>
  </div>
{/if}
