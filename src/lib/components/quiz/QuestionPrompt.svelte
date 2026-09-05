<script lang="ts">
  import { glyph, type Kana } from "../../core/kana";
  import type { Question } from "../../core/quiz";
  import { kanaAudio } from "../../audio";
  import PlayIcon from "../../ui/PlayIcon.svelte";
  import Waveform from "../../ui/Waveform.svelte";
  import PromptBox from "./PromptBox.svelte";
  import { t } from "../../i18n.svelte";

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

  // The glyph is measured against the frame, not the viewport, so a two
  // character yoon reading stays inside the box at any size or zoom.
  // Kana are full width, romaji roughly half, hence the two budgets.
  const fontSize = $derived.by(() => {
    const budget = question.prompt === "kana" ? 88 : 150;
    const cap = question.prompt === "kana" ? 60 : 42;
    return `${Math.min(cap, budget / Math.max(1, text.length))}cqi`;
  });
</script>

<div class="flex flex-col items-center gap-2 sm:gap-3">
  <span class="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
    {label}
  </span>

  <PromptBox size={question.prompt === "audio" ? "md" : "lg"}>
    {#if question.prompt === "audio"}
      <button
        type="button"
        class="flex size-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-3 transition-colors sm:gap-3 sm:p-5 lg:gap-4 lg:p-6 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("quiz.prompt.replay")}
        onclick={onreplay}
      >
        <span
          class="flex size-[44%] shrink-0 items-center justify-center rounded-full bg-foreground text-background sm:size-16 lg:size-20"
        >
          <PlayIcon {playing} class="size-[45%] translate-x-px sm:size-7 lg:size-8" />
        </span>
        <span class="h-[18%] w-full sm:h-7 lg:h-8">
          <Waveform
            peaks={kanaAudio.peaks(kana.audio ?? kana.romaji)}
            progress={playing ? kanaAudio.progress : 0}
          />
        </span>
      </button>
    {:else}
      <span
        class="whitespace-nowrap leading-none {question.prompt === 'kana'
          ? 'kana font-medium'
          : 'font-bold'}"
        style="font-size: {fontSize}"
      >
        {text}
      </span>
    {/if}
  </PromptBox>
</div>
