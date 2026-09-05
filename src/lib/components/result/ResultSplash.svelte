<script lang="ts">
  import { tierBlurb, tierEmoji, tierHeadline, type ScoreTier } from "../../core/score";
  import type { Summary } from "../../core/report";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";

  // Grade emoji and confetti shown briefly before the score report.

  let { tier, summary }: { tier: ScoreTier; summary: Summary } = $props();

  const FADE = 520;

  // each grade gets its own particle effect, not just more or less confetti
  type Effect = "fireworks" | "confetti" | "sparkles" | "dust" | "drizzle";

  type Party = {
    // how long the splash holds before it starts leaving
    hold: number;
    effect: Effect;
    // particles on screen at once
    count: number;
    // expanding rings behind the emoji
    rings: number;
    // how the emoji arrives
    entrance: string;
    // how it behaves once it is there
    idle: string;
    // halo behind the emoji
    glow: string;
    tones: string[];
  };

  const gold = "var(--color-gold)";
  const paper = "var(--color-foreground)";
  const mixed = [
    "var(--color-danger)",
    "var(--color-success)",
    gold,
    "var(--color-chart-4)",
    paper
  ];

  const parties: Record<ScoreTier, Party> = {
    perfect: {
      hold: 4200,
      effect: "fireworks",
      count: 168,
      rings: 4,
      entrance: "anim-splash-emoji-spin",
      idle: "anim-bounce-hold",
      glow: "bg-gold/30",
      tones: [gold, "var(--color-danger)", "var(--color-chart-4)", paper, gold]
    },
    great: {
      hold: 3000,
      effect: "confetti",
      count: 70,
      rings: 2,
      entrance: "anim-splash-emoji",
      idle: "anim-bounce-hold",
      glow: "bg-success/20",
      tones: mixed
    },
    good: {
      hold: 2600,
      effect: "sparkles",
      count: 60,
      rings: 1,
      entrance: "anim-splash-emoji",
      idle: "anim-nod",
      glow: "",
      tones: [gold, "var(--color-success)", paper]
    },
    fair: {
      hold: 2400,
      effect: "dust",
      count: 36,
      rings: 0,
      entrance: "anim-splash-emoji",
      idle: "anim-wobble",
      glow: "",
      tones: ["var(--color-chart-4)", "var(--color-muted-foreground)"]
    },
    poor: {
      hold: 2600,
      effect: "drizzle",
      count: 80,
      rings: 0,
      entrance: "anim-pop",
      idle: "anim-slump",
      glow: "",
      tones: ["var(--color-muted-foreground)"]
    }
  };

  // the grade is read once and held for the life of the splash
  // svelte-ignore state_referenced_locally
  const party = parties[tier];

  let leaving = $state(false);

  type Particle = { index: number; kind: string; style: string };

  function between(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  // fixed at setup so a re-render never reshuffles the particles
  function build(): Particle[] {
    const tone = (index: number): string => party.tones[index % party.tones.length];
    const count = party.count;

    if (party.effect === "fireworks") {
      // sparks are grouped into bursts, each burst firing from its own point
      const perBurst = 24;
      const bursts = Array.from({ length: Math.ceil(count / perBurst) }, (_, index) => ({
        left: between(16, 84),
        top: between(12, 52),
        delay: index * 0.3 + between(0, 0.12),
        tone: tone(index)
      }));
      return Array.from({ length: count }, (_, index) => {
        const burst = bursts[Math.floor(index / perBurst)];
        const angle = ((index % perBurst) / perBurst) * Math.PI * 2 + between(-0.12, 0.12);
        const reach = between(80, 190);
        return {
          index,
          kind: "anim-firework size-[10px] rounded-full",
          style: `left: ${burst.left}%; top: ${burst.top}%; background: ${burst.tone}; animation-delay: ${burst.delay}s; animation-duration: ${between(1.1, 1.5)}s; --dx: ${Math.round(Math.cos(angle) * reach)}px; --dy: ${Math.round(Math.sin(angle) * reach)}px`
        };
      });
    }

    if (party.effect === "confetti") {
      return Array.from({ length: count }, (_, index) => ({
        index,
        kind: `anim-confetti ${index % 3 === 0 ? "rounded-full" : "rounded-[2px]"}`,
        style: `left: ${Math.random() * 100}%; top: 0; width: ${8 + Math.round(Math.random() * 7)}px; height: ${16 + Math.round(Math.random() * 10)}px; background: ${tone(index)}; animation-delay: ${Math.random() * 0.7}s; animation-duration: ${between(1.6, 2.8)}s; --drift: ${Math.round(between(-40, 40))}px; --spin: ${Math.round(between(-270, 270))}deg`
      }));
    }

    if (party.effect === "sparkles") {
      return Array.from({ length: count }, (_, index) => ({
        index,
        kind: "anim-sparkle size-[8px] rounded-full",
        style: `left: ${Math.random() * 100}%; top: 100%; background: ${tone(index)}; box-shadow: 0 0 12px ${tone(index)}; animation-delay: ${Math.random() * 1.2}s; animation-duration: ${between(1.8, 2.8)}s; --drift: ${Math.round(between(-60, 60))}px`
      }));
    }

    if (party.effect === "dust") {
      return Array.from({ length: count }, (_, index) => ({
        index,
        kind: "anim-drift size-[14px] rounded-full opacity-50 blur-[2px]",
        style: `left: ${Math.random() * 100}%; top: 0; background: ${tone(index)}; animation-delay: ${Math.random() * 1.1}s; animation-duration: ${between(2.6, 4)}s; --drift: ${Math.round(between(-70, 70))}px`
      }));
    }

    return Array.from({ length: count }, (_, index) => ({
      index,
      kind: "anim-rain w-[2px] rounded-full",
      style: `left: ${Math.random() * 100}%; top: 0; height: ${14 + Math.round(Math.random() * 12)}px; background: ${tone(index)}; animation-delay: ${Math.random() * 1.2}s; animation-duration: ${between(0.8, 1.3)}s; --drift: ${Math.round(between(-14, -4))}px`
    }));
  }

  const pieces = build();

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
        <span class="absolute block {piece.kind}" style={piece.style}></span>
      {/each}
    </div>
  {/if}

  <div class="anim-splash-body relative flex flex-col items-center gap-3 px-6 text-center">
    <span class="relative flex items-center justify-center">
      {#if party.glow !== ""}
        <span
          class="anim-glow pointer-events-none absolute size-40 rounded-full blur-2xl sm:size-52 {party.glow}"
          aria-hidden="true"
        ></span>
      {/if}
      {#each rings as ring (ring)}
        <span
          class="anim-burst pointer-events-none absolute size-24 rounded-full border-2 border-gold sm:size-32"
          style="animation-delay: {ring * 0.28}s"
          aria-hidden="true"
        ></span>
      {/each}
      <!-- entrance and idle are separate elements, one animation each -->
      <span class="relative text-[5rem] leading-none sm:text-[6.5rem] {party.entrance}">
        <span class="inline-block {party.idle}">
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
      {t("result.skip")}
    </span>
  </div>
</div>
