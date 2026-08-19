<script lang="ts">
  import { statsByKana, statsByRow, summarize } from "../../core/report";
  import { app } from "../../state.svelte";
  import { exportReport } from "../../storage";
  import Button from "../../ui/Button.svelte";
  import Card from "../../ui/Card.svelte";
  import BarChart from "../charts/BarChart.svelte";
  import MissedAnswers from "./MissedAnswers.svelte";
  import ScoreHeadline from "./ScoreHeadline.svelte";

  const report = $derived(app.lastReport);
  const answers = $derived(report?.answers ?? []);
  const summary = $derived(summarize(answers));
  const misses = $derived(answers.filter((answer) => !answer.correct));

  async function saveCopy(): Promise<void> {
    if (report === null) return;
    const path = await exportReport(report);
    app.message = path === null ? "" : `Saved a copy to ${path}`;
  }
</script>

{#if report !== null}
  <div class="flex flex-col gap-5">
    <ScoreHeadline {report} {summary} />

    <div class="flex flex-wrap gap-2 sm:gap-3">
      <Button size="lg" variant="brand" onclick={() => app.start()}>Run it again</Button>
      <Button
        size="lg"
        variant="secondary"
        disabled={misses.length === 0}
        onclick={() => app.practiceMistakes(answers)}
      >
        Practice my mistakes
      </Button>
      <Button size="lg" variant="outline" onclick={saveCopy}>Save report to file</Button>
      <Button size="lg" variant="outline" onclick={() => app.go("reports")}>All reports</Button>
      <Button size="lg" variant="ghost" onclick={() => app.go("setup")}>Back to setup</Button>
    </div>

    {#if app.message !== ""}
      <p class="text-sm font-semibold text-success">{app.message}</p>
    {/if}

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Card title="Characters this run" description="Sorted by accuracy, weakest first.">
        <BarChart rows={statsByKana(answers)} limit={10} />
      </Card>
      <Card title="Rows this run" description="Where the trouble sits.">
        <BarChart rows={statsByRow(answers)} limit={10} />
      </Card>
    </div>

    <MissedAnswers {misses} />
  </div>
{/if}
