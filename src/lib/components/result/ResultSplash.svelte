<script lang="ts">
  import { tierBlurb, tierEmoji, tierHeadline, type ScoreTier } from "../../core/score";
  import type { Summary } from "../../core/report";
  import { app } from "../../state.svelte";

  // Grade emoji and confetti shown briefly before the score report.

  let { tier, summary }: { tier: ScoreTier; summary: Summary } = $props();

  const FADE = 520;

  type Party = {
    // how long the splash holds before it starts leaving
    hold: number;
    pieces: number;
    // confetti size range, in px
    size: number;
    // expanding rings behind the emoji
    rings: number;
    bounce: boolean;
  };

  const parties: Record<ScoreTier, Party> = {
    perfect: { hold: 3400, pieces: 90, size: 14, rings: 3, bounce: true },
    great: { hold: 2900, pieces: 54, size: 11, rings: 2, bounce: true },
    good: { hold: 2400, pieces: 30, size: 9, rings: 1, bounce: false },
    fair: { hold: 2100, pieces: 14, size: 8, rings: 0, bounce: false },
    poor: { hold: 2100, pieces: 0, size: 0, rings: 0, bounce: false }
  };

  // the grade is read once and held for the life of the splash
  // svelte-ignore state_referenced_locally
  const party = parties[tier];

  let leaving = $state(false);

  // confetti colours
  const tones = [
    "var(--color-danger)",
    "var(--color-success)",
    "var(--color-gold)",
    "var(--color-chart-4)",
    "var(--color-foreground)"
  ];

  // fixed at setup so a re-render never reshuffles the confetti
  const pieces = Array.from({ length: party.pieces }, (_, index) => ({
    index,
    left: Math.random() * 100,
    delay: Math.random() * 0.7,
    duration: 1.6 + Math.random() * 1.2,
    drift: Math.round(Math.random() * 80 - 40),
    spin: Math.round(Math.random() * 540 - 270),
    size: party.size - 4 + Math.round(Math.random() * 7),
    tone: tones[index % tones.length],
    round: index % 3 === 0
  }));

  const rings = Array.from({ length: party.rings }, (_, index) => index);

  function dismiss(): void {
    if (leaving) return;
    leaving = true;
    setTimeout(() => app.dismissSplash(), FADE);
  }

  $effect(() => {
    const hold = setTimeout(dismiss, party.hold);
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
  {#if pieces.length > 0}
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
    <span class="relative flex items-center justify-center">
      {#each rings as ring (ring)}
        <span
          class="anim-burst pointer-events-none absolute size-24 rounded-full border-2 border-gold sm:size-32"
          style="animation-delay: {ring * 0.36}s"
          aria-hidden="true"
        ></span>
      {/each}
      <!-- pop and bounce are separate elements, one animation each -->
      <span class="anim-splash-emoji relative text-[5rem] leading-none sm:text-[6.5rem]">
        <span class="inline-block {party.bounce ? 'anim-bounce-hold' : ''}">
          {tierEmoji(tier)}
        </span>
      </span>
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
