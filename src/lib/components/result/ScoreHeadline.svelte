<script lang="ts">
  import type { Report, Summary } from "../../core/report";
  import { scoreTier, tierEmoji, tierHeadline } from "../../core/score";
  import { t } from "../../i18n.svelte";

  let { report, summary }: { report: Report; summary: Summary } = $props();

  const tier = $derived(scoreTier(summary.accuracy, summary.total));
  const headline = $derived(tierHeadline(tier));

  const stats = $derived([
    { key: "accuracy", value: `${Math.round(summary.accuracy * 100)}%` },
    { key: "perQuestion", value: `${(summary.averageMs / 1000).toFixed(1)}s` },
    { key: "timedOut", value: `${summary.timedOut}` }
  ]);
</script>

<div
  class="anim-cheer flex flex-col gap-5 rounded-xl border border-border bg-sidebar p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
>
  <div class="flex flex-col gap-1">
    <span class="flex items-center gap-3 text-h1 font-bold leading-tight">
      <span aria-hidden="true">{tierEmoji(tier)}</span>
      {headline}
    </span>
    <span class="text-sm text-muted-foreground">
      {t("result.summary", {
        correct: summary.correct,
        total: summary.total,
        seconds: Math.round(report.durationMs / 1000)
      })}
    </span>
  </div>
  <div class="flex items-center gap-6 sm:gap-8">
    {#each stats as stat (stat.key)}
      <div class="flex flex-col items-start sm:items-center">
        <span class="text-h2 font-bold leading-none tabular-nums sm:text-h1">{stat.value}</span>
        <span class="text-xs uppercase tracking-wide text-muted-foreground">{t(`result.stat.${stat.key}`)}</span>
      </div>
    {/each}
  </div>
</div>
