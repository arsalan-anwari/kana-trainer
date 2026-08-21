<script lang="ts">
  import { reportFilterLabel, reportFilters, type Report, type ReportFilter } from "../../core/report";
  import { app } from "../../state.svelte";
  import { deleteReport, exportReport, importReport } from "../../storage";
  import Chip from "../../ui/Chip.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import ReportListItem from "./ReportListItem.svelte";

  let {
    reports,
    picked = $bindable<string[]>([]),
    filter = $bindable<ReportFilter>("all")
  }: { reports: Report[]; picked?: string[]; filter?: ReportFilter } = $props();

  const allPicked = $derived(
    reports.length > 0 && reports.every((report) => picked.includes(report.id))
  );

  let armed = $state(false);
  let armTimer: ReturnType<typeof setTimeout> | undefined;

  function toggle(id: string): void {
    picked = picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id];
  }

  function setFilter(next: ReportFilter): void {
    // runs that fall outside the new window cannot stay picked, and keeping the
    // ones that survive is not worth the surprise of a half kept selection
    filter = next;
    picked = [];
    disarm();
  }

  async function remove(id: string): Promise<void> {
    await deleteReport(id);
    picked = picked.filter((item) => item !== id);
    await app.refreshReports();
  }

  function disarm(): void {
    clearTimeout(armTimer);
    armed = false;
  }

  /** Wiping a window of runs cannot be undone, so the first click only arms it. */
  async function removeShown(): Promise<void> {
    if (!armed) {
      armed = true;
      clearTimeout(armTimer);
      armTimer = setTimeout(() => (armed = false), 4000);
      return;
    }
    disarm();
    const ids = reports.map((report) => report.id);
    for (const id of ids) await deleteReport(id);
    picked = picked.filter((item) => !ids.includes(item));
    await app.refreshReports();
    app.message = ids.length === 1 ? "Removed 1 run." : `Removed ${ids.length} runs.`;
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

<div class="flex flex-col gap-3">
  <div class="flex flex-wrap items-center gap-1.5">
    {#each reportFilters as option (option)}
      <Chip size="sm" active={filter === option} onclick={() => setFilter(option)}>
        {reportFilterLabel(option)}
      </Chip>
    {/each}
  </div>

  <div class="flex items-center justify-between gap-2">
    <span class="text-xs text-muted-foreground">
      {picked.length === 0 ? `${reports.length} shown` : `${picked.length} of ${reports.length}`}
    </span>
    <div class="flex items-center gap-1.5">
      <IconButton
        size="sm"
        icon="select-all"
        label="Select every run shown"
        disabled={reports.length === 0 || allPicked}
        onclick={() => (picked = reports.map((report) => report.id))}
      />
      <IconButton
        size="sm"
        icon="select-none"
        label="Clear the selection"
        disabled={picked.length === 0}
        onclick={() => (picked = [])}
      />
      <IconButton
        size="sm"
        icon="trash"
        label={armed
          ? `Click again to remove ${reports.length === 1 ? "this run" : `all ${reports.length} runs shown`}`
          : "Remove every run shown"}
        variant={armed ? "danger" : "outline"}
        disabled={reports.length === 0}
        onclick={removeShown}
      />
      <IconButton size="sm" icon="folder-open" label="Load a report file" onclick={load} />
    </div>
  </div>

  <div class="flex max-h-[26rem] flex-col gap-2 overflow-y-auto lg:max-h-[34rem]">
    {#each reports as report (report.id)}
      <ReportListItem
        {report}
        picked={picked.includes(report.id)}
        ontoggle={() => toggle(report.id)}
        onsave={() => saveOne(report.id)}
        onremove={() => remove(report.id)}
      />
    {:else}
      <p class="py-8 text-center text-sm text-muted-foreground">
        {filter === "all"
          ? "No reports yet. Finish a run and it lands here."
          : "No runs in this window."}
      </p>
    {/each}
  </div>
</div>
