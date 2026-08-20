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

  function toggle(id: string): void {
    picked = picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id];
  }

  function setFilter(next: ReportFilter): void {
    // runs that fall outside the new window cannot stay picked, and keeping the
    // ones that survive is not worth the surprise of a half kept selection
    filter = next;
    picked = [];
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
