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
  import AccuracyGrid from "../charts/AccuracyGrid.svelte";
  import RowHeatmap from "../charts/RowHeatmap.svelte";
  import ScriptSplit from "../charts/ScriptSplit.svelte";
  import MistakeBreakdown from "./MistakeBreakdown.svelte";
  import ReportList from "./ReportList.svelte";
  import { t } from "../../i18n.svelte";
  import { Badge, Button, Card, EmptyState, Icon, Stat } from "kaizen-ui";

  let picked = $state<string[]>([]);
  let query = $state<ReportQuery>({ ...anyQuery });

  const shown = $derived(queryReports(app.reports, query));
  const chosen = $derived(
    picked.length === 0 ? shown : shown.filter((report) => picked.includes(report.id))
  );
  const answers = $derived(chosen.flatMap((report) => report.answers));
  const summary = $derived(summarize(answers));
  const tags = $derived(queryLabels(query));
  const mastered = $derived(
    statsByKana(answers).filter((row) => row.mastery === "mastered").length
  );

  const seen = $derived(scriptsSeen(answers));
</script>

<div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
  <ReportList reports={shown} bind:picked bind:query />

  <div class="flex flex-col gap-5">
    <div class="sheet ruled flex flex-col gap-4 rounded-2xl border-2 border-border bg-sidebar p-4 sm:p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 flex-col gap-1">
          <span class="text-h2 font-bold leading-tight">
            {picked.length > 0
              ? t("reports.selected", { count: picked.length })
              : windowLabel(query.window)}
          </span>
          {#if tags.length > 0}
            
            <div class="flex flex-wrap gap-1">
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
          <Icon name="flame" class="size-5" />
          {t("reports.practice")}
        </Button>
      </div>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          tone="brand"
          value="{Math.round(summary.accuracy * 100)}%"
          label={t("reports.stat.accuracy")}
        />
        <Stat value={chosen.length} label={t("reports.stat.runs")} />
        <Stat value={summary.total} label={t("reports.stat.answers")} />
        <Stat tone="success" value={mastered} label={t("reports.stat.mastered")} />
      </div>
    </div>

    {#if app.message !== ""}
      <p class="text-sm font-semibold text-success">{app.message}</p>
    {/if}

    <Card title={t("reports.weakest.title")} description={t("reports.weakest.description")}>
      {#snippet icon()}<Icon name="target" class="size-5" />{/snippet}
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
        <EmptyState icon="target" title={t("reports.weakest.empty")} />
      {/each}
    </Card>

    <Card title={t("reports.rows.title")} description={t("reports.rows.description")}>
      {#snippet icon()}<Icon name="sprout" class="size-5" />{/snippet}
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
        <EmptyState icon="sprout" title={t("reports.rows.empty")} />
      {/each}
    </Card>

    <Card title={t("reports.alphabets.title")} description={t("reports.alphabets.description")}>
      {#snippet icon()}<Icon name="trophy" class="size-5" />{/snippet}
      <ScriptSplit {answers} scripts={seen} />
    </Card>

    <MistakeBreakdown {answers} />
  </div>
</div>
