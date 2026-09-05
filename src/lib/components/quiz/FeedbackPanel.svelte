<script lang="ts">
  import { glyph, type Kana } from "../../core/kana";
  import type { Question } from "../../core/quiz";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import { t } from "../../i18n.svelte";

  let { question, kana }: { question: Question; kana: Kana } = $props();
</script>

<!-- Pinned to the bottom edge and drawn over the run, so the verdict never
     pushes the question around or waits behind the navigation strip. The quiz
     screen keeps a matching band free, so nothing moves when this appears. -->
<div
  class="anim-pop fixed inset-x-0 bottom-0 z-30 border-t-2 pl-[calc(env(safe-area-inset-left,0px)+1rem)] pt-4 pr-[calc(env(safe-area-inset-right,0px)+1rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] {app.lastCorrect
    ? 'border-success bg-success-soft'
    : 'border-danger bg-danger-soft'}"
>
  <!-- the verdict wraps inside its own column rather than dropping the button
       onto a second row, so the bar keeps a predictable height -->
  <div class="mx-auto flex w-full max-w-xl items-center justify-between gap-4">
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
    <span class="shrink-0">
      <Button size="lg" variant="primary" onclick={() => app.next()}>{t("quiz.continue")}</Button>
    </span>
  </div>
</div>
