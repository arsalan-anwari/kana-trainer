<script lang="ts">
  import {
    filterReports,
    statsByKana,
    statsByRow,
    statsByScript,
    summarize,
    type ReportFilter
  } from "../../core/report";
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import Card from "../../ui/Card.svelte";
  import BarChart from "../charts/BarChart.svelte";
  import MistakeBreakdown from "./MistakeBreakdown.svelte";
  import ReportList from "./ReportList.svelte";

  let picked = $state<string[]>([]);
  let filter = $state<ReportFilter>("all");

  const shown = $derived(filterReports(app.reports, filter));
  const chosen = $derived(
    picked.length === 0 ? shown : shown.filter((report) => picked.includes(report.id))
  );
  const answers = $derived(chosen.flatMap((report) => report.answers));
  const summary = $derived(summarize(answers));
</script>

<div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
  <ReportList reports={shown} bind:picked bind:filter />

  <div class="flex flex-col gap-5">
    <div
      class="flex flex-col gap-4 rounded-xl border border-border bg-sidebar p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex flex-col gap-1">
        <span class="text-h2 font-bold leading-tight">
          {picked.length === 0 ? "All runs" : `${picked.length} runs selected`}
        </span>
        <span class="text-sm text-muted-foreground">
          {summary.correct} of {summary.total} correct, {Math.round(summary.accuracy * 100)}% overall
        </span>
      </div>
      <Button
        size="lg"
        variant="brand"
        disabled={answers.length === 0}
        onclick={() => app.practiceMistakes(answers)}
      >
        Practice these mistakes
      </Button>
    </div>

    {#if app.message !== ""}
      <p class="text-sm font-semibold text-success">{app.message}</p>
    {/if}

    <Card title="Characters" description="Weakest characters across the selected runs.">
      <BarChart
        rows={statsByKana(answers)}
        limit={16}
        empty="Finish a run to see character stats."
      />
    </Card>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Card title="Rows" description="Which rows need work.">
        <BarChart rows={statsByRow(answers)} limit={16} empty="No rows yet." />
      </Card>
      <Card title="Alphabets" description="Hiragana against katakana.">
        <BarChart rows={statsByScript(answers)} empty="No alphabet data yet." />
      </Card>
    </div>

    <MistakeBreakdown {answers} />
  </div>
</div>
