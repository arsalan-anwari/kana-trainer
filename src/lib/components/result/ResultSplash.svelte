<script lang="ts">
  import { tierBlurb, tierEmoji, tierHeadline, type ScoreTier } from "../../core/score";
  import type { Summary } from "../../core/report";
  import { app } from "../../state.svelte";

  /**
   * The moment between the last answer and the numbers: one emoji for how it
   * went, then it gets out of the way and fades into the report behind it.
   */

  let { tier, summary }: { tier: ScoreTier; summary: Summary } = $props();

  const HOLD = 2100;
  const FADE = 520;

  let leaving = $state(false);

  const cheerful = $derived(tier === "perfect" || tier === "great" || tier === "good");

  /** The two accents the palette allows, plus a gold for the win. */
  const tones = [
    "var(--color-danger)",
    "var(--color-success)",
    "var(--color-gold)",
    "var(--color-chart-4)",
    "var(--color-foreground)"
  ];

  /** Fixed at setup so a re-render never reshuffles the confetti mid flight. */
  const pieces = Array.from({ length: 42 }, (_, index) => ({
    index,
    left: Math.random() * 100,
    delay: Math.random() * 0.7,
    duration: 1.6 + Math.random() * 1.2,
    drift: Math.round(Math.random() * 80 - 40),
    spin: Math.round(Math.random() * 540 - 270),
    size: 7 + Math.round(Math.random() * 7),
    tone: tones[index % tones.length],
    round: index % 3 === 0
  }));

  function dismiss(): void {
    if (leaving) return;
    leaving = true;
    setTimeout(() => app.dismissSplash(), FADE);
  }

  $effect(() => {
    const hold = setTimeout(dismiss, HOLD);
    return () => clearTimeout(hold);
  });
</script>

<svelte:window onkeydown={dismiss} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_element_interactions -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background {leaving
    ? 'anim-splash-out'
    : 'anim-splash-in'}"
  role="status"
  aria-live="polite"
  onclick={dismiss}
>
  {#if cheerful}
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      {#each pieces as piece (piece.index)}
        <span
          class="anim-confetti absolute top-0 block {piece.round ? 'rounded-full' : 'rounded-[2px]'}"
          style="left: {piece.left}%; width: {piece.size}px; height: {piece.size *
            1.6}px; background: {piece.tone}; animation-delay: {piece.delay}s; animation-duration: {piece.duration}s; --drift: {piece.drift}px; --spin: {piece.spin}deg"
        ></span>
      {/each}
    </div>
  {/if}

  <div class="anim-splash-body relative flex flex-col items-center gap-3 px-6 text-center">
    <span class="anim-splash-emoji text-[5rem] leading-none sm:text-[6.5rem]">
      {tierEmoji(tier)}
    </span>
    <span class="text-h1 font-bold leading-tight">{tierHeadline(tier)}</span>
    <span class="text-base text-muted-foreground">{tierBlurb(tier)}</span>
    <span class="text-h3 font-bold tabular-nums">
      {summary.correct} / {summary.total}
      <span class="text-muted-foreground">· {Math.round(summary.accuracy * 100)}%</span>
    </span>
    <span class="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
      Tap anywhere to skip
    </span>
  </div>
</div>
