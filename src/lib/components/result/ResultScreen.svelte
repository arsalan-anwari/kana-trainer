<script lang="ts">
  import { heatByRow, scriptsSeen, statsByKana, summarize } from "../../core/report";
  import { app } from "../../state.svelte";
  import { exportReports } from "../../storage";
  import AccuracyGrid from "../charts/AccuracyGrid.svelte";
  import RowHeatmap from "../charts/RowHeatmap.svelte";
  import ScriptSplit from "../charts/ScriptSplit.svelte";
  import MissedAnswers from "./MissedAnswers.svelte";
  import ResultSplash from "./ResultSplash.svelte";
  import ScoreHeadline from "./ScoreHeadline.svelte";
  import { t } from "../../i18n.svelte";
  import { Button, Card, EmptyState, Icon } from "kaizen-ui";

  const report = $derived(app.lastReport);
  const answers = $derived(report?.answers ?? []);
  const summary = $derived(summarize(answers));
  const misses = $derived(answers.filter((answer) => !answer.correct));
  const seen = $derived(scriptsSeen(answers));

  async function saveCopy(): Promise<void> {
    if (report === null) return;
    try {
      const saved = await exportReports([report]);
      app.message = saved ? t("result.exported") : "";
    } catch {
      app.message = t("common.file.writeFailed");
    }
  }
</script>

{#if app.splash !== null}
  <ResultSplash tier={app.splash} {summary} />
{/if}

{#if report !== null}
  <div class="flex flex-col gap-5">
    <ScoreHeadline {report} {summary} />

    <div class="flex flex-wrap gap-2 sm:gap-3">
      <Button size="lg" variant="brand" onclick={() => app.start()}>{t("result.again")}</Button>
      <Button
        size="lg"
        variant="secondary"
        disabled={misses.length === 0}
        onclick={() => app.practiceMistakes(answers)}
      >
        {t("result.practice")}
      </Button>
      <Button size="lg" variant="outline" onclick={saveCopy}>{t("result.export")}</Button>
      <Button size="lg" variant="outline" onclick={() => app.go("reports")}>{t("result.allReports")}</Button>
      <Button size="lg" variant="ghost" onclick={() => app.go("setup")}>{t("result.back")}</Button>
    </div>

    {#if app.message !== ""}
      <p class="text-sm font-semibold text-success">{app.message}</p>
    {/if}

    <Card title={t("result.characters.title")} description={t("reports.weakest.description")}>
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

    <Card title={t("result.rows.title")} description={t("reports.rows.description")}>
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

    {#if seen.length > 1}
      <Card title={t("reports.alphabets.title")} description={t("reports.alphabets.description")}>
        {#snippet icon()}<Icon name="trophy" class="size-5" />{/snippet}
        <ScriptSplit {answers} scripts={seen} />
      </Card>
    {/if}

    <MissedAnswers {misses} />
  </div>
{/if}
