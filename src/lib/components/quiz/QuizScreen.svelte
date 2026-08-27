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
    // the run is on hold behind the dialog, which owns the keyboard until it goes
    if (app.confirmQuit) return;

    if (event.key === "Escape") {
      app.askQuit();
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

{#if app.confirmQuit}
  <QuitConfirm />
{/if}

{#if question !== null && kana !== null}
  <div class="flex min-h-[calc(100dvh-10rem)] flex-col gap-3 sm:min-h-0 sm:gap-6">
    <QuizStatusBar />

    <div class="flex flex-1 flex-col items-center gap-4 sm:gap-7">
      {#if secondsLeft !== null}
        <div class="w-full max-w-xs">
          <Progress
            value={(app.questionRemaining ?? 0) / (app.settings.perQuestionSeconds * 10)}
            tone={secondsLeft <= 3 ? "danger" : "primary"}
          />
        </div>
      {/if}

      {#key question.index}
        <!-- prompt up top, answers down by the thumb, the gap between them takes the slack -->
        <div
          class="anim-pop flex w-full flex-1 flex-col items-center justify-between gap-4 sm:flex-none sm:justify-start sm:gap-7"
        >
          <div class="flex flex-1 items-center sm:flex-none">
            <QuestionPrompt {question} {kana} onreplay={() => app.replayPrompt()} />
          </div>

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
