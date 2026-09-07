<script lang="ts">
  import type { ChoiceState } from "./choiceState";

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

  const fontSize = $derived(
    `${Math.min(kana ? 46 : 34, (kana ? 78 : 130) / Math.max(1, label.length))}cqi`
  );

  const tones: Record<ChoiceState, string> = {
    idle: "border-border bg-surface shadow-[0_4px_0_var(--color-border)] hover:border-selected hover:bg-accent active:translate-y-[4px] active:shadow-none",
    staged: "border-selected bg-selected-soft shadow-[0_4px_0_var(--color-selected)]",
    correct:
      "border-success/50 bg-success-soft text-success shadow-[0_4px_0_color-mix(in_srgb,var(--success)_35%,transparent)]",
    wrong:
      "border-danger/50 bg-danger-soft text-danger shadow-[0_4px_0_color-mix(in_srgb,var(--danger)_35%,transparent)] anim-shake",
    dimmed: "border-border bg-surface opacity-40"
  };
</script>

<button
  type="button"
  {disabled}
  class="@container relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-2xl border-2 transition-[transform,background-color,border-color,color] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default {tones[
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
    class="whitespace-nowrap text-center font-bold leading-none {kana ? 'kana' : ''}"
    style="font-size: {fontSize}"
  >
    {label}
  </span>
</button>
