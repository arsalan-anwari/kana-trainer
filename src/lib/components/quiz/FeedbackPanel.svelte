<script lang="ts">
  import { glyph, type Kana } from "../../core/kana";
  import type { Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { Button } from "kaizen-ui";

  let { question, kana }: { question: Question; kana: Kana } = $props();
</script>

<div
  class="anim-pop fade-edge fixed inset-x-0 bottom-0 z-30 pl-[calc(env(safe-area-inset-left,0px)+1rem)] pt-8 pr-[calc(env(safe-area-inset-right,0px)+1rem)] pb-[calc(var(--nav-bar)+1rem)]"
  style="--tint: color-mix(in srgb, {app.lastCorrect
    ? 'var(--success)'
    : 'var(--danger)'} 26%, transparent)"
>
  
  <div class="mx-auto flex w-full max-w-xl items-center justify-between gap-4">
    <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
      <div class="flex min-w-0 flex-col gap-1">
        <span class="text-h4 font-bold {app.lastCorrect ? 'text-success' : 'text-danger'}">
          {t(app.lastCorrect ? "quiz.correct" : "quiz.wrong")}
        </span>
        <span class="text-sm text-foreground">
          <span class="kana">{glyph(kana, question.script)}</span>
          =
          <span class="font-semibold">{kana.romaji}</span>
          {#if kana.alt.length > 0}
            <span class="text-muted-foreground">
              ({t("quiz.alsoReads", { list: kana.alt.join(", ") })})
            </span>
          {/if}
        </span>
      </div>
    </div>
    <span class="shrink-0">
      <Button size="lg" variant="primary" onclick={() => app.next()}>{t("quiz.continue")}</Button>
    </span>
  </div>
</div>
