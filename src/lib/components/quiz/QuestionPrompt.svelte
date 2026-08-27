<script lang="ts">
  import { glyph, type Kana } from "../../core/kana";
  import type { Question } from "../../core/quiz";
  import { kanaAudio } from "../../audio";
  import PlayIcon from "../../ui/PlayIcon.svelte";
  import Waveform from "../../ui/Waveform.svelte";
  import PromptBox from "./PromptBox.svelte";

  let {
    question,
    kana,
    onreplay
  }: { question: Question; kana: Kana; onreplay: () => void } = $props();

  const label = $derived.by(() => {
    if (question.prompt === "audio") return "Listen and pick the answer";
    if (question.answer === "audio") return "Pick the matching sound";
    if (question.prompt === "kana") return "Which romaji is this";
    return "Which character is this";
  });

  const playing = $derived(kana.audio !== null && kanaAudio.playing === kana.audio);
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
        aria-label="Play the sound again"
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
    {:else if question.prompt === "kana"}
      <span class="kana text-[4.5rem] font-medium leading-none sm:text-[6.5rem] lg:text-[8rem]">
        {glyph(kana, question.script)}
      </span>
    {:else}
      <span class="text-[2.75rem] font-bold leading-none sm:text-[4rem] lg:text-[5rem]">
        {kana.romaji}
      </span>
    {/if}
  </PromptBox>
</div>
