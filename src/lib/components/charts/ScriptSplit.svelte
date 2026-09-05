<script lang="ts">
  import type { Script } from "../../core/kana";
  import type { Answer } from "../../core/quiz";
  import { summarize } from "../../core/report";
  import { heatColor } from "./heat";
  import { t } from "../../i18n.svelte";

  // One dial per alphabet that actually turns up in the shown runs, so a view
  // narrowed to hiragana draws a single dial rather than half an empty
  // comparison. The bar under the counts is the share of the work each alphabet
  // carried, which is the part a plain accuracy figure hides.

  let {
    answers,
    scripts
  }: { answers: Answer[]; scripts: Script[] } = $props();

  const parts = $derived(
    scripts.map((script) => ({
      script,
      label: t(`common.${script}`),
      stats: summarize(answers.filter((answer) => answer.script === script))
    }))
  );

  const busiest = $derived(Math.max(1, ...parts.map((part) => part.stats.total)));
</script>

{#if parts.length === 0}
  <p class="py-6 text-center text-sm text-muted-foreground">{t("reports.noData")}</p>
{:else}
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {#each parts as part (part.script)}
      <div class="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
        <div
          class="grid size-16 shrink-0 place-items-center rounded-full"
          style="background: conic-gradient({heatColor(part.stats.accuracy)} {Math.round(
            part.stats.accuracy * 100
          )}%, var(--color-secondary) 0)"
          aria-hidden="true"
        >
          <div
            class="grid size-11 place-items-center rounded-full bg-background text-xs font-bold tabular-nums"
          >
            {Math.round(part.stats.accuracy * 100)}%
          </div>
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <span class="text-sm font-semibold">{part.label}</span>
          <span class="text-xs tabular-nums text-muted-foreground">
            {t("reports.tip.rowRight", { correct: part.stats.correct, total: part.stats.total })}
          </span>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              class="h-full rounded-full bg-foreground/40"
              style="width: {Math.max(6, Math.round((part.stats.total / busiest) * 100))}%"
            ></div>
          </div>
          <span class="text-[0.625rem] text-muted-foreground">
            {t("reports.alphabets.share", {
              percent: Math.round((part.stats.total / Math.max(1, answers.length)) * 100)
            })}
          </span>
        </div>
      </div>
    {/each}
  </div>
{/if}
