<script lang="ts">
  import { glyph, kanaById } from "../core/kana";
  import { statsByKana, statsByRow, summarize } from "../core/report";
  import { app } from "../state.svelte";
  import { exportReport } from "../storage";
  import Badge from "../ui/Badge.svelte";
  import Button from "../ui/Button.svelte";
  import Card from "../ui/Card.svelte";
  import BarChart from "./BarChart.svelte";

  const report = $derived(app.lastReport);
  const summary = $derived(summarize(report?.answers ?? []));
  const misses = $derived((report?.answers ?? []).filter((answer) => !answer.correct));
  const kanaStats = $derived(statsByKana(report?.answers ?? []));
  const rowStats = $derived(statsByRow(report?.answers ?? []));

  async function saveCopy(): Promise<void> {
    if (report === null) return;
    const path = await exportReport(report);
    app.message = path === null ? "" : `Saved a copy to ${path}`;
  }

  function headline(): string {
    if (summary.accuracy >= 0.95) return "Nearly perfect";
    if (summary.accuracy >= 0.8) return "Strong run";
    if (summary.accuracy >= 0.5) return "Getting there";
    return "Keep practicing";
  }
</script>

{#if report !== null}
  <div class="scroll-area -mr-2 flex h-full flex-col gap-5 pr-2">
    <div class="anim-cheer flex items-center justify-between rounded-xl bg-sidebar p-6">
      <div class="flex flex-col gap-1">
        <span class="text-h1 font-bold leading-none">{headline()}</span>
        <span class="text-sm text-muted-foreground">
          {summary.correct} of {summary.total} correct in
          {Math.round(report.durationMs / 1000)} seconds
        </span>
      </div>
      <div class="flex items-center gap-8">
        <div class="flex flex-col items-center">
          <span class="text-h1 font-bold leading-none text-brand">
            {Math.round(summary.accuracy * 100)}%
          </span>
          <span class="text-xs uppercase tracking-wide text-muted-foreground">accuracy</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-h1 font-bold leading-none">
            {(summary.averageMs / 1000).toFixed(1)}s
          </span>
          <span class="text-xs uppercase tracking-wide text-muted-foreground">per question</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-h1 font-bold leading-none">{summary.timedOut}</span>
          <span class="text-xs uppercase tracking-wide text-muted-foreground">timed out</span>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <Button size="lg" variant="brand" onclick={() => app.start()}>Run it again</Button>
      <Button
        size="lg"
        variant="secondary"
        disabled={misses.length === 0}
        onclick={() => app.practiceMistakes(report.answers)}
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

    <div class="grid grid-cols-2 gap-5">
      <Card title="Characters this run" description="Sorted by accuracy, weakest first.">
        <BarChart rows={kanaStats} limit={10} />
      </Card>
      <Card title="Rows this run" description="Where the trouble sits.">
        <BarChart rows={rowStats} limit={10} />
      </Card>
    </div>

    <Card title="Missed answers" description="Every question you did not get right.">
      {#if misses.length === 0}
        <p class="py-4 text-center text-sm text-muted-foreground">Nothing missed, well done.</p>
      {:else}
        <div class="flex flex-wrap gap-3">
          {#each misses as miss, index (index)}
            {@const kana = kanaById(miss.kanaId)}
            {#if kana}
              <div
                class="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-2"
              >
                <span class="kana text-h2">{glyph(kana, miss.script)}</span>
                <div class="flex flex-col">
                  <span class="text-sm font-semibold">{kana.romaji}</span>
                  <span class="text-xs text-muted-foreground">
                    {miss.timedOut ? "ran out of time" : `you said ${miss.given || "nothing"}`}
                  </span>
                </div>
                <Badge tone="danger">{miss.script === "hiragana" ? "hira" : "kata"}</Badge>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </Card>
  </div>
{/if}
