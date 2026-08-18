<script lang="ts">
  import { glyph, kanaById } from "../core/kana";
  import type { Choice } from "../core/quiz";
  import { app } from "../state.svelte";
  import Button from "../ui/Button.svelte";
  import Progress from "../ui/Progress.svelte";
  import TextField from "../ui/TextField.svelte";

  const question = $derived(app.current);
  const kana = $derived(question === null ? null : (kanaById(question.kanaId) ?? null));
  const perQuestionSeconds = $derived(
    app.questionRemaining === null ? null : Math.ceil(app.questionRemaining / 1000)
  );
  const totalLabel = $derived(() => {
    if (app.totalRemaining === null) return null;
    const seconds = Math.ceil(app.totalRemaining / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
  });

  function choiceLabel(choice: Choice): string {
    const item = kanaById(choice.kanaId);
    if (item === null || item === undefined || question === null) return "";
    if (question.answer === "kana") return glyph(item, choice.script);
    if (question.answer === "romaji") return item.romaji;
    return "";
  }

  function choiceTone(choice: Choice): string {
    if (app.phase === "answering" || question === null) {
      return "border-border bg-background shadow-[0_4px_0_var(--color-border)] hover:bg-accent hover:border-brand active:shadow-none active:translate-y-[4px]";
    }
    if (choice.kanaId === question.kanaId) {
      return "border-success bg-success-soft text-success";
    }
    if (app.picked !== null && app.picked.kanaId === choice.kanaId) {
      return "border-danger bg-danger-soft text-danger anim-shake";
    }
    return "border-border bg-background opacity-50";
  }

  function pick(choice: Choice): void {
    app.answerChoice(choice);
  }

  let playingSlot = $state<number | null>(null);
  let audioProgress = $state(0);
  let stopTracking: (() => void) | null = null;

  function preview(choice: Choice, slot: number): void {
    const audio = app.playChoice(choice);
    stopTracking?.();
    stopTracking = null;
    if (audio === null) {
      playingSlot = null;
      audioProgress = 0;
      return;
    }
    playingSlot = slot;
    audioProgress = 0;
    const onTime = () => {
      audioProgress =
        audio.duration > 0 && !Number.isNaN(audio.duration)
          ? (audio.currentTime / audio.duration) * 100
          : 0;
    };
    const onEnd = () => {
      if (playingSlot === slot) {
        playingSlot = null;
        audioProgress = 0;
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    stopTracking = () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }

  $effect(() => {
    void question?.index;
    stopTracking?.();
    stopTracking = null;
    playingSlot = null;
    audioProgress = 0;
  });

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
    if (app.settings.answerStyle === "choice") {
      const slot = Number(event.key);
      if (slot >= 1 && slot <= question.choices.length) {
        const choice = question.choices[slot - 1];
        if (question.answer === "audio") preview(choice, slot - 1);
        else pick(choice);
      }
      if (event.key === "r") app.replayPrompt();
    }
  }
</script>

<svelte:window onkeydown={keydown} />

{#if question !== null && kana !== null}
  <div class="flex h-full flex-col gap-6">
    <div class="flex items-center gap-4">
      <Button size="sm" variant="ghost" onclick={() => app.quit()}>Quit</Button>
      <Progress value={app.progress} class="flex-1" />
      <span class="w-24 text-right text-sm font-semibold">
        {app.index + 1} / {app.questions.length}
      </span>
      <span class="rounded-md bg-secondary px-3 py-1 text-sm font-semibold">
        {app.score} correct
      </span>
      {#if totalLabel() !== null}
        <span
          class="rounded-md px-3 py-1 text-sm font-semibold {(app.totalRemaining ?? 0) < 15000
            ? 'bg-danger-soft text-danger'
            : 'bg-secondary'}"
        >
          {totalLabel()}
        </span>
      {/if}
    </div>

    <div class="flex flex-1 flex-col items-center justify-center gap-8">
      {#if perQuestionSeconds !== null}
        <div class="w-64">
          <Progress
            value={(app.questionRemaining ?? 0) / (app.settings.perQuestionSeconds * 10)}
            tone={perQuestionSeconds <= 3 ? "danger" : "primary"}
          />
        </div>
      {/if}

      {#key question.index}
        <div class="anim-pop flex flex-col items-center gap-4">
          <span class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {#if question.prompt === "audio"}
              Listen and pick the answer
            {:else if question.answer === "audio"}
              Pick the matching sound
            {:else if question.prompt === "kana"}
              Which romaji is this
            {:else}
              Which character is this
            {/if}
          </span>

          {#if question.prompt === "audio"}
            <Button size="xl" variant="secondary" onclick={() => app.replayPrompt()}>
              Play sound again
            </Button>
          {:else if question.prompt === "kana"}
            <span class="kana text-[7rem] font-medium leading-none">
              {glyph(kana, question.script)}
            </span>
          {:else}
            <span class="text-[5rem] font-bold leading-none">{kana.romaji}</span>
          {/if}
        </div>
      {/key}

      {#if app.settings.answerStyle === "choice"}
        <div class="grid w-full max-w-3xl grid-cols-2 gap-4">
          {#each question.choices as choice, slot (choice.kanaId)}
            {#if question.answer === "audio"}
              <div
                role="button"
                tabindex="0"
                class="flex h-24 cursor-pointer items-center gap-4 rounded-xl border-2 px-6 transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {choiceTone(
                  choice
                )}"
                onclick={() => pick(choice)}
                onkeydown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    pick(choice);
                  }
                }}
              >
                <span class="text-xs font-bold text-muted-foreground">{slot + 1}</span>
                <button
                  type="button"
                  class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-brand-foreground shadow-[0_3px_0_var(--color-brand-shadow)] transition-transform duration-100 hover:brightness-105 active:translate-y-[3px] active:shadow-none"
                  aria-label="Play sound {slot + 1}"
                  onclick={(event) => {
                    event.stopPropagation();
                    preview(choice, slot);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 translate-x-px" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <Progress value={playingSlot === slot ? audioProgress : 0} tone="brand" class="flex-1" />
                <span class="hidden shrink-0 text-xs font-semibold text-muted-foreground sm:inline">
                  Tap to choose
                </span>
              </div>
            {:else}
              <button
                type="button"
                class="flex h-24 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 text-h2 font-semibold transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {choiceTone(
                  choice
                )}"
                onclick={() => pick(choice)}
              >
                <span class="text-xs font-bold text-muted-foreground">{slot + 1}</span>
                <span class={question.answer === "kana" ? "kana" : ""}>{choiceLabel(choice)}</span>
              </button>
            {/if}
          {/each}
        </div>
      {:else}
        <div class="flex w-full max-w-md flex-col gap-3">
          <TextField
            bind:value={app.typed}
            big
            focusOnMount
            placeholder={app.settings.format === "audio-text"
              ? "Type the kana or romaji"
              : question.answer === "kana"
                ? "Type the kana"
                : "Type the romaji"}
            disabled={app.phase !== "answering"}
            onenter={() => app.submitTyped()}
          />
          <Button
            size="lg"
            variant="brand"
            full
            disabled={app.phase !== "answering" || app.typed.trim() === ""}
            onclick={() => app.submitTyped()}
          >
            Check
          </Button>
        </div>
      {/if}
    </div>

    <div class="h-24">
      {#if app.phase === "feedback"}
        <div
          class="anim-pop flex h-full items-center justify-between gap-6 rounded-xl px-6 {app.lastCorrect
            ? 'bg-success-soft'
            : 'bg-danger-soft'}"
        >
          <div class="flex flex-col gap-1">
            <span
              class="text-h4 font-bold {app.lastCorrect ? 'text-success' : 'text-danger'}"
            >
              {app.lastCorrect ? "Correct" : "Not quite"}
            </span>
            <span class="text-sm text-foreground">
              <span class="kana">{glyph(kana, question.script)}</span>
              is
              <span class="font-semibold">{kana.romaji}</span>
              {#if kana.alt.length > 0}
                <span class="text-muted-foreground">(also {kana.alt.join(", ")})</span>
              {/if}
            </span>
          </div>
          <Button size="lg" variant={app.lastCorrect ? "brand" : "primary"} onclick={() => app.next()}>
            Continue
          </Button>
        </div>
      {/if}
    </div>
  </div>
{/if}
