<script lang="ts">
  import { kanaAudio } from "../../audio";
  import type { Kana } from "../../core/kana";
  import PlayIcon from "../../ui/PlayIcon.svelte";
  import { t } from "../../i18n.svelte";

  let { kana }: { kana: Kana } = $props();

  const playing = $derived(kanaAudio.playing === kana.audio);
</script>

<button
  type="button"
  aria-label={t("chart.play", { romaji: kana.romaji, kata: kana.kata })}
  aria-pressed={playing}
  class="group relative flex aspect-[3/2] w-full cursor-pointer flex-col items-center justify-center gap-1 sm:aspect-square overflow-hidden rounded-xl border transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {playing
    ? 'border-2 border-selected bg-selected-soft text-foreground'
    : 'border-border bg-surface text-foreground hover:border-selected hover:bg-accent active:translate-y-[1px]'}"
  onclick={() => kanaAudio.play(kana.audio)}
>
  <span
    class="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-60 {playing
      ? 'opacity-100'
      : ''}"
    aria-hidden="true"
  >
    <PlayIcon {playing} class="size-3" />
  </span>

  <span class="text-h3 leading-none font-bold sm:text-h4">{kana.romaji}</span>
  <span class="kana flex items-baseline gap-0.5 leading-none text-muted-foreground">
    {#if kana.hira !== ""}
      <span class="text-base sm:text-sm">{kana.hira}</span>
      <span class="text-[0.625rem] opacity-50" aria-hidden="true">·</span>
    {/if}
    <span class="text-base sm:text-sm">{kana.kata}</span>
  </span>

  {#if playing}
    <span class="absolute inset-x-0 bottom-0 h-1 bg-border" aria-hidden="true">
      <span
        class="block h-full bg-selected transition-[width] duration-100"
        style="width: {Math.round(kanaAudio.progress * 100)}%"
      ></span>
    </span>
  {/if}
</button>
