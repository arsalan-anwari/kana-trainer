<script lang="ts">
  import type { ChoiceState } from "./choiceState";

  /** A square multiple choice answer. Square keeps the tap target large on phones. */

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
  class="relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-2xl border-2 transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default {tones[
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
    class="px-2 text-center font-semibold leading-none {kana
      ? 'kana text-[3rem] sm:text-[3.75rem] lg:text-[4.25rem]'
      : 'text-h2 sm:text-[2.5rem] lg:text-[3rem]'}"
  >
    {label}
  </span>
</button>
