<script lang="ts">
  import { reportFilterLabel, reportFilters, type Report, type ReportFilter } from "../../core/report";
  import { app } from "../../state.svelte";
  import { deleteReport, exportReports, fileLabel, importReports } from "../../storage";
  import Chip from "../../ui/Chip.svelte";
  import ConfirmDialog from "../../ui/ConfirmDialog.svelte";
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

  const target = $derived(
    picked.length === 0 ? reports : reports.filter((report) => picked.includes(report.id))
  );
  const targetLabel = $derived(
    picked.length === 0
      ? `${reports.length === 1 ? "the run" : `all ${reports.length} runs`} shown`
      : `${picked.length === 1 ? "1 selected run" : `${picked.length} selected runs`}`
  );

  let confirming = $state(false);

  function setFilter(next: ReportFilter): void {
    // runs that fall outside the new window cannot stay picked, and keeping the
    // ones that survive is not worth the surprise of a half kept selection
    filter = next;
    picked = [];
    confirming = false;
  }

  function toggle(id: string): void {
    picked = picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id];
  }

  async function removeTarget(): Promise<void> {
    confirming = false;
    const ids = target.map((report) => report.id);
    for (const id of ids) await deleteReport(id);
    picked = picked.filter((item) => !ids.includes(item));
    await app.refreshReports();
    app.message = ids.length === 1 ? "Removed 1 run." : `Removed ${ids.length} runs.`;
  }

  async function save(): Promise<void> {
    try {
      const path = await exportReports(target);
      if (path === null) return;
      const count = target.length === 1 ? "1 run" : `${target.length} runs`;
      app.message = `Exported ${count} to ${fileLabel(path)}`;
    } catch (error) {
      app.message = error instanceof Error ? error.message : "That file could not be written.";
    }
  }

  async function load(): Promise<void> {
    try {
      const result = await importReports();
      if (result === null) return;
      await app.refreshReports();
      const added = result.added === 1 ? "1 run" : `${result.added} runs`;
      app.message =
        result.skipped === 0
          ? `Imported ${added}.`
          : `Imported ${added}, ${result.skipped} already here.`;
    } catch (error) {
      app.message = error instanceof Error ? error.message : "That file could not be read.";
    }
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
        label="Remove {targetLabel}"
        disabled={target.length === 0}
        onclick={() => (confirming = true)}
      />
      <IconButton
        size="sm"
        icon="download"
        label="Export {targetLabel} to a .kt-report file"
        disabled={target.length === 0}
        onclick={save}
      />
      <IconButton
        size="sm"
        icon="folder-open"
        label="Import runs from a .kt-report file"
        onclick={load}
      />
    </div>
  </div>

  <div class="flex max-h-[26rem] flex-col gap-2 overflow-y-auto lg:max-h-[34rem]">
    {#each reports as report (report.id)}
      <ReportListItem
        {report}
        picked={picked.includes(report.id)}
        ontoggle={() => toggle(report.id)}
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

{#if confirming}
  <ConfirmDialog
    title={target.length === 1 ? "Remove this run?" : `Remove ${target.length} runs?`}
    confirmLabel={target.length === 1 ? "Remove the run" : `Remove ${target.length} runs`}
    cancelLabel={target.length === 1 ? "Keep it" : "Keep them"}
    onconfirm={removeTarget}
    oncancel={() => (confirming = false)}
  >
    This throws away {picked.length === 0 ? "every run in view" : "the runs you picked"} for
    good. Export them to a .kt-report file first if you want to keep a copy.
  </ConfirmDialog>
{/if}
