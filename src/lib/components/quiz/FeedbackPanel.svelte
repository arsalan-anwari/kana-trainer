<script lang="ts">
  import { glyph, type Kana } from "../../core/kana";
  import type { Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";

  let { question, kana }: { question: Question; kana: Kana } = $props();

  let panel = $state<HTMLDivElement | null>(null);

  // scroll the verdict into view
  $effect(() => {
    panel?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
</script>

<div
  bind:this={panel}
  class="anim-pop flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 px-4 py-4 sm:px-6 {app.lastCorrect
    ? 'border-success bg-success-soft'
    : 'border-danger bg-danger-soft'}"
>
  <div class="flex flex-col gap-1">
    <span class="text-h4 font-bold {app.lastCorrect ? 'text-success' : 'text-danger'}">
      {app.lastCorrect ? "Correct" : "Not quite"}
    </span>
    <span class="text-sm text-foreground">
      <span class="kana">{glyph(kana, question.script)}</span>
      is
      <span class="font-semibold">{kana.romaji}</span>
      {#if kana.alt.length > 0}
        <span class="text-muted-foreground">(also {kana.alt.join(", ")})</span>
      {/if}
    </span>
  </div>
  <Button size="lg" variant="primary" onclick={() => app.next()}>Continue</Button>
</div>
