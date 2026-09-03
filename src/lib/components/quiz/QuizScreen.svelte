<script lang="ts">
  import { kanaById } from "../../core/kana";
  import { app } from "../../state.svelte";
  import Progress from "../../ui/Progress.svelte";
  import ChoiceGrid from "./ChoiceGrid.svelte";
  import FeedbackPanel from "./FeedbackPanel.svelte";
  import QuestionPrompt from "./QuestionPrompt.svelte";
  import QuitConfirm from "./QuitConfirm.svelte";
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
    // the quit dialog owns the keyboard while it is open
    if (app.confirmQuit) return;

    if (event.key === "Escape") {
      app.askQuit();
      return;
    }

    // the answer field owns every other key while it has focus, so submitting
    // with Enter does not also bubble up and skip past the verdict
    if (event.target instanceof HTMLInputElement) return;

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

{#if app.confirmQuit}
  <QuitConfirm />
{/if}

{#if question !== null && kana !== null}
  <!-- one screen, no scrolling, with the verdict on the bottom edge -->
  <div class="flex min-h-0 flex-1 flex-col gap-2 sm:gap-6">
    <QuizStatusBar />

    <!-- on a phone the run rides up against the progress bar, so the virtual
         keyboard has the whole lower half to itself. pb-32 is the band the
         pinned verdict bar sits in; it is held free the whole run so nothing
         shifts when the verdict arrives, and it is in rem so it grows with the
         zoom control the same way the bar does -->
    <div
      class="flex min-h-0 flex-1 flex-col items-center justify-start gap-3 pb-24 sm:justify-center sm:gap-7"
    >
      {#if secondsLeft !== null}
        <div class="w-full max-w-xs">
          <Progress
            value={(app.questionRemaining ?? 0) / (app.settings.perQuestionSeconds * 10)}
            tone={secondsLeft <= 3 ? "danger" : "primary"}
          />
        </div>
      {/if}

      {#key question.index}
        <!-- prompt on top, answers below -->
        <div class="anim-pop flex w-full flex-col items-center gap-3 sm:gap-7">
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
    </div>

    {#if app.phase === "feedback"}
      <FeedbackPanel {question} {kana} />
    {/if}
  </div>
{/if}
