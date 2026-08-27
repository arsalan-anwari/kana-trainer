<script lang="ts">
  import { kanaAudio } from "../../audio";
  import PlayIcon from "../../ui/PlayIcon.svelte";
  import Waveform from "../../ui/Waveform.svelte";
  import type { ChoiceState } from "./choiceState";

  /**
   * One wide sound tile: a play control, a histogram of the clip and the slot
   * number. Pressing it plays the sound and marks it as the current pick, it
   * does not submit anything on its own.
   */

  let {
    slot,
    audio,
    state = "idle",
    disabled = false,
    onpick
  }: {
    slot: number;
    audio: string;
    state?: ChoiceState;
    disabled?: boolean;
    onpick: () => void;
  } = $props();

  const playing = $derived(kanaAudio.playing === audio);

  const tones: Record<ChoiceState, string> = {
    idle: "border-border bg-surface hover:border-foreground hover:bg-accent",
    staged: "border-foreground bg-foreground text-background",
    correct: "border-success bg-success-soft text-success",
    wrong: "border-danger bg-danger-soft text-danger anim-shake",
    dimmed: "border-border bg-surface opacity-40"
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
  aria-label="Sound {slot}"
  class="flex h-16 w-full cursor-pointer items-center gap-3 rounded-2xl border-2 px-3 transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default sm:h-22 sm:gap-5 sm:px-5 {tones[
    state
  ]}"
  onclick={onpick}
>
  <span class="w-4 shrink-0 text-left text-xs font-bold opacity-60" aria-hidden="true">{slot}</span>
  <span
    class="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors sm:size-13 {knob}"
    aria-hidden="true"
  >
    <PlayIcon {playing} class="size-4 translate-x-px sm:size-5" />
  </span>
  <span class="h-10 min-w-0 flex-1 sm:h-12">
    <Waveform
      peaks={kanaAudio.peaks(audio)}
      progress={playing ? kanaAudio.progress : 0}
      tone={waveTone}
    />
  </span>
</button>
