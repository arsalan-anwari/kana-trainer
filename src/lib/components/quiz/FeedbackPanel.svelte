<script lang="ts">
  import { glyph, type Kana } from "../../core/kana";
  import type { Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { Button, Glyph } from "kaizen-ui";

  let {
    question,
    kana,
    tight = false
  }: { question: Question; kana: Kana; tight?: boolean } = $props();

  const tone = $derived(app.lastCorrect ? "var(--success)" : "var(--danger)");
</script>

{#if tight}
  <!-- Too short to dock below the answers: the verdict takes over the prompt
       half and tints the rest, which stays clickable so the sounds can be
       replayed. -->
  <div
    class="anim-pop pointer-events-none fixed inset-0 z-30 flex [--end:right] rtl:[--end:left]"
    style="background: linear-gradient(to var(--end), color-mix(in srgb, {tone} 22%, var(--background)) 50%, color-mix(in srgb, {tone} 26%, transparent) 50%)"
  >
    <div
      class="flex w-1/2 items-center justify-center pt-[var(--header-height)] pb-[var(--nav-bar)] pl-[calc(env(safe-area-inset-left,0px)+1rem)] pr-4 rtl:pl-4 rtl:pr-[calc(env(safe-area-inset-right,0px)+1rem)]"
    >
      <div class="pointer-events-auto flex min-w-0 flex-col items-center gap-4 text-center">
        {@render verdict()}
        <Button size="lg" variant="primary" onclick={() => app.next()}>{t("quiz.continue")}</Button>
      </div>
    </div>
  </div>
{:else}
  <div
    class="anim-pop fade-edge fixed bottom-0 left-0 right-0 z-30 pt-8 pl-[calc(env(safe-area-inset-left,0px)+1rem)] pr-[calc(env(safe-area-inset-right,0px)+1rem)] pb-[calc(var(--nav-bar)+1rem)]"
    style="--tint: color-mix(in srgb, {tone} 26%, transparent)"
  >
    <div class="mx-auto flex w-full max-w-xl items-center justify-between gap-4">
      <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        {@render verdict()}
      </div>
      <span class="shrink-0">
        <Button size="lg" variant="primary" onclick={() => app.next()}>{t("quiz.continue")}</Button>
      </span>
    </div>
  </div>
{/if}

{#snippet verdict()}
  <div class="flex min-w-0 flex-col gap-1">
    <span class="text-h4 font-bold {app.lastCorrect ? 'text-success' : 'text-danger'}">
      {t(app.lastCorrect ? "quiz.correct" : "quiz.wrong")}
    </span>
    <span class="text-sm text-foreground">
      <Glyph text={glyph(kana, question.script)} />
      =
      <span class="font-semibold">{kana.romaji}</span>
      {#if kana.alt.length > 0}
        <span class="text-muted-foreground">
          ({t("quiz.alsoReads", { list: kana.alt.join(", ") })})
        </span>
      {/if}
    </span>
  </div>
{/snippet}
