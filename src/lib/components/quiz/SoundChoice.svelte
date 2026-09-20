<script lang="ts">
  import { kanaAudio } from "../../audio";
  import type { ChoiceState } from "./choiceState";
  import { t } from "../../i18n.svelte";
  import { PlayIcon, Waveform } from "kaizen-ui";

  let {
    slot,
    audio,
    split = false,
    state = "idle",
    disabled = false,
    onpick
  }: {
    slot: number;
    audio: string;
    /** Side by side with the prompt: the row is bounded by the window height. */
    split?: boolean;
    state?: ChoiceState;
    disabled?: boolean;
    onpick: () => void;
  } = $props();

  const playing = $derived(kanaAudio.playing === audio);

  const tones: Record<ChoiceState, string> = {
    idle: "border-border bg-surface hover:border-foreground hover:bg-accent",
    staged: "border-foreground bg-foreground text-background",
    correct: "border-success/50 bg-success-soft text-success",
    wrong: "border-danger/50 bg-danger-soft text-danger anim-shake",
    dimmed: "border-border bg-surface opacity-60"
  };

  const waveTone = $derived(
    state === "staged"
      ? "strong"
      : state === "correct"
        ? "success"
        : state === "wrong"
          ? "danger"
          : "muted"
  );

  const knob = $derived(
    state === "staged" ? "bg-background text-foreground" : "bg-foreground text-background"
  );
</script>

<button
  type="button"
  {disabled}
  aria-pressed={state === "staged"}
  aria-label={t("quiz.soundTile", { slot })}
  class="flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 px-3 transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default sm:gap-5 sm:px-5 {split
    ? 'h-[clamp(2.75rem,calc((var(--answer-max)-3.5rem)/2),5.5rem)]'
    : 'h-16 sm:h-22'} {tones[state]}"
  onclick={onpick}
>
  <span class="w-4 shrink-0 text-left text-xs font-bold opacity-60" aria-hidden="true">{slot}</span>
  <span
    class="flex shrink-0 items-center justify-center rounded-full transition-colors {split
      ? 'size-[clamp(1.75rem,calc((var(--answer-max)-3.5rem)/3),3.25rem)]'
      : 'size-11 sm:size-13'} {knob}"
    aria-hidden="true"
  >
    <PlayIcon {playing} class="size-4 translate-x-px sm:size-5" />
  </span>
  <span class="min-w-0 flex-1 {split ? 'h-[clamp(1.5rem,calc((var(--answer-max)-3.5rem)/3),3rem)]' : 'h-10 sm:h-12'}">
    <Waveform
      peaks={kanaAudio.peaks(audio)}
      progress={playing ? kanaAudio.progress : 0}
      tone={waveTone}
    />
  </span>
</button>
