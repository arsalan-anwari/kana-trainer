<script lang="ts">
  import {
    anyQuery,
    heatByRow,
    queryLabels,
    queryReports,
    scriptsSeen,
    statsByKana,
    summarize,
    windowLabel,
    type ReportQuery
  } from "../../core/report";
  import { app } from "../../state.svelte";
  import Badge from "../../ui/Badge.svelte";
  import Button from "../../ui/Button.svelte";
  import Card from "../../ui/Card.svelte";
  import AccuracyGrid from "../charts/AccuracyGrid.svelte";
  import RowHeatmap from "../charts/RowHeatmap.svelte";
  import ScriptSplit from "../charts/ScriptSplit.svelte";
  import MistakeBreakdown from "./MistakeBreakdown.svelte";
  import ReportList from "./ReportList.svelte";
  import { t } from "../../i18n.svelte";

  let picked = $state<string[]>([]);
  let query = $state<ReportQuery>({ ...anyQuery });

  const shown = $derived(queryReports(app.reports, query));
  const chosen = $derived(
    picked.length === 0 ? shown : shown.filter((report) => picked.includes(report.id))
  );
  const answers = $derived(chosen.flatMap((report) => report.answers));
  const summary = $derived(summarize(answers));
  const tags = $derived(queryLabels(query));

  // Every chart below follows this, so narrowing the alphabet or the tags takes
  // the charts with it rather than leaving a half empty comparison behind.
  const seen = $derived(scriptsSeen(answers));
</script>

<div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
  <ReportList reports={shown} bind:picked bind:query />

  <div class="flex flex-col gap-5">
    <div
      class="flex flex-col gap-4 rounded-xl border border-border bg-sidebar p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex min-w-0 flex-col gap-1">
        <span class="text-h2 font-bold leading-tight">
          {picked.length > 0
            ? t("reports.selected", { count: picked.length })
            : windowLabel(query.window)}
        </span>
        <span class="text-sm text-muted-foreground">
          {t("reports.overall", {
            correct: summary.correct,
            total: summary.total,
            percent: Math.round(summary.accuracy * 100)
          })}
        </span>
        {#if tags.length > 0}
          <!-- the same boxes a run card carries, so the heading stays short -->
          <div class="mt-1 flex flex-wrap gap-1">
            {#each tags as tag (tag)}
              <Badge tone="outline">{tag}</Badge>
            {/each}
          </div>
        {/if}
      </div>
      <Button
        size="lg"
        variant="brand"
        disabled={answers.length === 0}
        onclick={() => app.practiceMistakes(answers)}
      >
        {t("reports.practice")}
      </Button>
    </div>

    {#if app.message !== ""}
      <p class="text-sm font-semibold text-success">{app.message}</p>
    {/if}

    <Card title={t("reports.weakest.title")} description={t("reports.weakest.description")}>
      {#each seen as script (script)}
        {#if seen.length > 1}
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t(`common.${script}`)}
          </p>
        {/if}
        <div class:mb-4={seen.length > 1}>
          <AccuracyGrid
            rows={statsByKana(
              answers.filter((answer) => answer.script === script),
              script
            )}
            limit={16}
          />
        </div>
      {:else}
        <p class="py-6 text-center text-sm text-muted-foreground">
          {t("reports.weakest.empty")}
        </p>
      {/each}
    </Card>

    <Card title={t("reports.rows.title")} description={t("reports.rows.description")}>
      {#each seen as script (script)}
        {#if seen.length > 1}
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t(`common.${script}`)}
          </p>
        {/if}
        <div class:mb-4={seen.length > 1}>
          <RowHeatmap heat={heatByRow(answers, script)} />
        </div>
      {:else}
        <p class="py-6 text-center text-sm text-muted-foreground">{t("reports.rows.empty")}</p>
      {/each}
    </Card>

    <Card title={t("reports.alphabets.title")} description={t("reports.alphabets.description")}>
      <ScriptSplit {answers} scripts={seen} />
    </Card>

    <MistakeBreakdown {answers} />
  </div>
</div>
