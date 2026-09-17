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
  import { Announcer, keynav, Progress } from "kaizen-ui";
  import { t } from "../../i18n.svelte";

  const question = $derived(app.current);
  const kana = $derived(question === null ? null : (kanaById(question.kanaId) ?? null));
  const secondsLeft = $derived(
    app.questionRemaining === null ? null : Math.ceil(app.questionRemaining / 1000)
  );
  const picksSound = $derived(question !== null && question.answer === "audio");

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
  
  <div class="flex min-h-0 flex-1 flex-col gap-2 sm:gap-6">
    <Announcer message={asked} />
    <Announcer assertive message={said} />

    <QuizStatusBar />

    
    <div
      data-section
      class="flex min-h-0 flex-1 flex-col items-center justify-start gap-3 pb-24 sm:justify-center sm:gap-7"
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
