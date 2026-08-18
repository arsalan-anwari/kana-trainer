<script lang="ts">
  import { statsByKana, statsByRow, statsByScript, summarize } from "../core/report";
  import { answerStyleLabel, formatLabel } from "../core/settings";
  import { app } from "../state.svelte";
  import { deleteReport, exportReport, importReport } from "../storage";
  import Badge from "../ui/Badge.svelte";
  import Button from "../ui/Button.svelte";
  import Card from "../ui/Card.svelte";
  import BarChart from "./BarChart.svelte";

  let picked = $state<string[]>([]);

  const chosen = $derived(
    picked.length === 0 ? app.reports : app.reports.filter((report) => picked.includes(report.id))
  );
  const answers = $derived(chosen.flatMap((report) => report.answers));
  const summary = $derived(summarize(answers));

  function toggle(id: string): void {
    picked = picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id];
  }

  function label(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  async function remove(id: string): Promise<void> {
    await deleteReport(id);
    picked = picked.filter((item) => item !== id);
    await app.refreshReports();
  }

  async function load(): Promise<void> {
    const report = await importReport();
    await app.refreshReports();
    app.message = report === null ? "" : "Report loaded.";
  }

  async function saveOne(id: string): Promise<void> {
    const report = app.reports.find((item) => item.id === id);
    if (report === undefined) return;
    const path = await exportReport(report);
    app.message = path === null ? "" : `Saved a copy to ${path}`;
  }
</script>

<div class="grid h-full min-h-0 grid-cols-[minmax(260px,340px)_minmax(300px,1fr)] gap-4 xl:gap-6">
  <div class="flex h-full min-h-0 flex-col gap-4">
    <div class="flex gap-2">
      <Button size="sm" variant="outline" onclick={load}>Load report file</Button>
      <Button size="sm" variant="ghost" onclick={() => (picked = [])}>Use all</Button>
    </div>

    <div class="scroll-area -mr-2 flex-1 pr-2">
      <div class="flex flex-col gap-2">
        {#each app.reports as report (report.id)}
          {@const stats = summarize(report.answers)}
          <div
            class="flex items-center gap-3 rounded-lg border p-3 transition-colors {picked.includes(
              report.id
            )
              ? 'border-brand bg-brand/10'
              : 'border-border bg-background'}"
          >
            <button
              type="button"
              class="flex flex-1 cursor-pointer flex-col items-start gap-1 text-left"
              onclick={() => toggle(report.id)}
            >
              <span class="text-sm font-semibold">{label(report.createdAt)}</span>
              <span class="text-xs text-muted-foreground">
                {stats.correct}/{stats.total} correct, {Math.round(stats.accuracy * 100)}%
              </span>
              <div class="flex gap-1">
                <Badge tone="outline">{formatLabel(report.settings.format)}</Badge>
                <Badge tone="outline">{answerStyleLabel(report.settings.answerStyle)}</Badge>
              </div>
            </button>
            <div class="flex flex-col gap-1">
              <Button size="sm" variant="ghost" onclick={() => saveOne(report.id)}>Save</Button>
              <Button size="sm" variant="ghost" onclick={() => remove(report.id)}>Delete</Button>
            </div>
          </div>
        {:else}
          <p class="py-8 text-center text-sm text-muted-foreground">
            No reports yet. Finish a run and it lands here.
          </p>
        {/each}
      </div>
    </div>
  </div>

  <div class="scroll-area -mr-2 flex min-h-0 flex-col gap-5 pr-2">
    <div class="flex items-center justify-between rounded-xl bg-sidebar p-6">
      <div class="flex flex-col gap-1">
        <span class="text-h2 font-bold leading-none">
          {picked.length === 0 ? "All runs" : `${picked.length} runs selected`}
        </span>
        <span class="text-sm text-muted-foreground">
          {summary.correct} of {summary.total} correct, {Math.round(summary.accuracy * 100)}% overall
        </span>
      </div>
      <div class="flex gap-3">
        <Button
          size="lg"
          variant="brand"
          disabled={answers.length === 0}
          onclick={() => app.practiceMistakes(answers)}
        >
          Practice these mistakes
        </Button>
        <Button size="lg" variant="ghost" onclick={() => app.go("setup")}>Back to setup</Button>
      </div>
    </div>

    {#if app.message !== ""}
      <p class="text-sm font-semibold text-success">{app.message}</p>
    {/if}

    <Card title="Characters" description="Weakest characters across the selected runs.">
      <BarChart rows={statsByKana(answers)} limit={16} empty="Finish a run to see character stats." />
    </Card>

    <div class="grid grid-cols-2 gap-5">
      <Card title="Rows" description="Which rows need work.">
        <BarChart rows={statsByRow(answers)} limit={16} empty="No rows yet." />
      </Card>
      <Card title="Alphabets" description="Hiragana against katakana.">
        <BarChart rows={statsByScript(answers)} empty="No alphabet data yet." />
      </Card>
    </div>
  </div>
</div>
