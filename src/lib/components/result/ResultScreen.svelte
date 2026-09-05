<script lang="ts">
  import { statsByKana, statsByRow, summarize } from "../../core/report";
  import { app } from "../../state.svelte";
  import { exportReports, fileLabel } from "../../storage";
  import Button from "../../ui/Button.svelte";
  import Card from "../../ui/Card.svelte";
  import BarChart from "../charts/BarChart.svelte";
  import MissedAnswers from "./MissedAnswers.svelte";
  import ResultSplash from "./ResultSplash.svelte";
  import ScoreHeadline from "./ScoreHeadline.svelte";
  import { t } from "../../i18n.svelte";

  const report = $derived(app.lastReport);
  const answers = $derived(report?.answers ?? []);
  const summary = $derived(summarize(answers));
  const misses = $derived(answers.filter((answer) => !answer.correct));

  async function saveCopy(): Promise<void> {
    if (report === null) return;
    try {
      const path = await exportReports([report]);
      app.message = path === null ? "" : t("result.exported", { file: fileLabel(path) });
    } catch (error) {
      app.message = error instanceof Error ? error.message : t("common.file.writeFailed");
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

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Card title={t("result.characters.title")} description={t("result.characters.description")}>
        <BarChart rows={statsByKana(answers)} limit={10} />
      </Card>
      <Card title={t("result.rows.title")} description={t("result.rows.description")}>
        <BarChart rows={statsByRow(answers)} limit={10} />
      </Card>
    </div>

    <MissedAnswers {misses} />
  </div>
{/if}
