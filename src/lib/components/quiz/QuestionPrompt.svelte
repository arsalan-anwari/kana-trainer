<script lang="ts">
  import { glyph, type Kana } from "../../core/kana";
  import type { Question } from "../../core/quiz";
  import { kanaAudio } from "../../audio";
  import { t } from "../../i18n.svelte";
  import { Board, RecordPlayer, viewport } from "kaizen-ui";

  let {
    question,
    kana,
    onreplay
  }: { question: Question; kana: Kana; onreplay: () => void } = $props();

  const label = $derived.by(() => {
    if (question.prompt === "audio") return t("quiz.prompt.listen");
    if (question.answer === "audio") return t("quiz.prompt.pickSound");
    if (question.prompt === "kana") return t("quiz.prompt.whichRomaji");
    return t("quiz.prompt.whichKana");
  });

  const playing = $derived(kana.audio !== null && kanaAudio.playing === kana.audio);

  const text = $derived(question.prompt === "kana" ? glyph(kana, question.script) : kana.romaji);

  const compact = $derived(!viewport.wide);

  const fontSize = $derived.by(() => {
    const budget = question.prompt === "kana" ? 88 : 150;
    const cap = question.prompt === "kana" ? 60 : 42;
    return `${Math.min(cap, budget / Math.max(1, text.length))}cqmin`;
  });
</script>

<div class="flex w-full flex-col items-center gap-2 sm:gap-3">
  <span class="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
    {label}
  </span>

  {#if question.prompt === "audio"}
    <div
      class="w-full {compact
        ? 'h-[min(6.5rem,14dvh)] max-w-sm'
        : 'max-w-[13rem] sm:max-w-[15rem]'}"
    >
      <RecordPlayer
        {compact}
        {playing}
        peaks={kanaAudio.peaks(kana.audio ?? kana.romaji)}
        progress={playing ? kanaAudio.progress : 0}
        label={t("quiz.prompt.replay")}
        onplay={onreplay}
      />
    </div>
  {:else}
    <Board size="lg" {compact}>
      <span
        class="whitespace-nowrap leading-none {question.prompt === 'kana'
          ? 'kana font-medium'
          : 'font-bold'}"
        style="font-size: {fontSize}"
      >
        {text}
      </span>
    </Board>
  {/if}
</div>
