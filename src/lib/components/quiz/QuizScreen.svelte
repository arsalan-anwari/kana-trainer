<script lang="ts">
  import { glyph, kanaById } from "../../core/kana";
  import { app } from "../../state.svelte";
  import ChoiceGrid from "./ChoiceGrid.svelte";
  import FeedbackPanel from "./FeedbackPanel.svelte";
  import QuestionPrompt from "./QuestionPrompt.svelte";
  import QuitConfirm from "./QuitConfirm.svelte";
  import QuizStatusBar from "./QuizStatusBar.svelte";
  import SoundChoiceList from "./SoundChoiceList.svelte";
  import TypingAnswer from "./TypingAnswer.svelte";
  import { Announcer, keynav, Progress, viewport } from "kaizen-ui";
  import { t } from "../../i18n.svelte";

  const question = $derived(app.current);
  const kana = $derived(question === null ? null : (kanaById(question.kanaId) ?? null));
  const secondsLeft = $derived(
    app.questionRemaining === null ? null : Math.ceil(app.questionRemaining / 1000)
  );
  const picksSound = $derived(question !== null && question.answer === "audio");

  // A window wider than it is tall (desktop, tablet, phone held sideways) has
  // room to sit the prompt beside the answers instead of stacking them, which
  // is what used to push a run off the bottom of the screen.
  const split = $derived(viewport.landscape && viewport.wide);
  // Too little height to also park the feedback panel below the answers, so it
  // docks over the prompt half instead and the answers keep their room.
  const tight = $derived(split && viewport.short);
  const half = $derived(split ? "flex min-w-0 flex-1 justify-center" : "flex w-full justify-center");

  const asked = $derived.by(() => {
    if (question === null || kana === null || app.phase !== "answering") return "";
    const prompt =
      question.prompt === "audio"
        ? t("quiz.prompt.listen")
        : question.prompt === "kana"
          ? glyph(kana, question.script)
          : kana.romaji;
    return t("quiz.announce", {
      index: app.index + 1,
      total: app.questions.length,
      prompt
    });
  });

  const said = $derived.by(() => {
    if (question === null || kana === null || app.phase !== "feedback") return "";
    const reading = t("quiz.reading", {
      kana: glyph(kana, question.script),
      romaji: kana.romaji
    });
    return `${t(app.lastCorrect ? "quiz.correct" : "quiz.wrong")}. ${reading}`;
  });

  function keydown(event: KeyboardEvent): void {
    if (question === null) return;
    if (app.confirmQuit) return;

    if (event.key === "Escape") {
      app.askQuit();
      return;
    }

    if (event.target instanceof HTMLInputElement) return;

    if (app.phase === "feedback") {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        app.next();
        return;
      }
      // The sound tiles stay live after an answer so the correct reading and the
      // one that was picked can be replayed side by side.
      const replay = Number(event.key);
      if (keynav.active && picksSound && replay >= 1 && replay <= question.choices.length) {
        app.playChoice(question.choices[replay - 1]);
      }
      return;
    }

    if (event.key === "r") {
      if (keynav.active) app.replayPrompt();
      return;
    }

    if (app.settings.answerStyle !== "choice") return;

    const slot = Number(event.key);
    if (keynav.active && slot >= 1 && slot <= question.choices.length) {
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
  
  <div class="flex min-h-0 flex-1 flex-col gap-2 {viewport.short ? '' : 'sm:gap-6'}">
    <Announcer message={asked} />
    <Announcer assertive message={said} />

    <QuizStatusBar />

    
    <div
      data-section
      class="flex min-h-0 flex-1 flex-col items-center gap-3 {split
        ? `justify-center ${tight ? 'pb-4' : 'pb-20'}`
        : 'justify-start pb-24 sm:justify-center sm:gap-7'}"
      style={split
        ? // What is left for the prompt and the answers once the header, the
          // system bars, the status row and the feedback panel have their share.
          `--answer-max: calc(100dvh - var(--header-height) - var(--nav-bar) - ${tight ? "6.5rem" : "10.5rem"})`
        : ""}
    >
      {#if secondsLeft !== null}
        <div class="w-full max-w-xs">
          <Progress
            value={(app.questionRemaining ?? 0) / (app.settings.perQuestionSeconds * 1000)}
            tone={secondsLeft <= 3 ? "danger" : "primary"}
            label={t("quiz.timeLeft")}
          />
        </div>
      {/if}

      {#key question.index}
        <div
          class="anim-pop flex w-full items-center {split
            ? 'justify-center gap-6 lg:gap-10'
            : 'flex-col gap-3 sm:gap-7'}"
        >
          <div class={half}>
            <QuestionPrompt {question} {kana} {split} onreplay={() => app.replayPrompt()} />
          </div>

          <div class={half}>
            {#if app.settings.answerStyle !== "choice"}
              <TypingAnswer {question} {split} />
            {:else if picksSound}
              <SoundChoiceList {question} {split} />
            {:else}
              <ChoiceGrid {question} {split} />
            {/if}
          </div>
        </div>
      {/key}
    </div>

    {#if app.phase === "feedback"}
      <FeedbackPanel {question} {kana} {tight} />
    {/if}
  </div>
{/if}
