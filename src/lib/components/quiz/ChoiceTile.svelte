<script lang="ts">
  import type { ChoiceState } from "./choiceState";

  // A square multiple choice answer tile.

  let {
    slot,
    label,
    kana = false,
    state = "idle",
    disabled = false,
    onpick
  }: {
    slot: number;
    label: string;
    kana?: boolean;
    state?: ChoiceState;
    disabled?: boolean;
    onpick: () => void;
  } = $props();

  // Sized against the tile, not the viewport, so a two character yoon reading
  // fits at any tile size or zoom. Kana are full width, romaji roughly half.
  const fontSize = $derived(
    `${Math.min(kana ? 46 : 34, (kana ? 78 : 130) / Math.max(1, label.length))}cqi`
  );

  const tones: Record<ChoiceState, string> = {
    idle: "border-border bg-surface hover:border-foreground hover:bg-accent active:translate-y-[2px]",
    staged: "border-foreground bg-foreground/5",
    correct: "border-success bg-success-soft text-success",
    wrong: "border-danger bg-danger-soft text-danger anim-shake",
    dimmed: "border-border bg-surface opacity-40"
  };
</script>

<button
  type="button"
  {disabled}
  class="@container relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-2xl border-2 transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default {tones[
    state
  ]}"
  onclick={onpick}
>
  <span
    class="absolute left-3 top-2 text-xs font-bold text-muted-foreground sm:left-4 sm:top-3"
    aria-hidden="true"
  >
    {slot}
  </span>
  <span
    class="whitespace-nowrap text-center font-semibold leading-none {kana ? 'kana' : ''}"
    style="font-size: {fontSize}"
  >
    {label}
  </span>
</button>
