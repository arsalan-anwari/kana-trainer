<script lang="ts">
  import { app } from "../../state.svelte";
  import { deleteReport, exportReport, importReport } from "../../storage";
  import Button from "../../ui/Button.svelte";
  import ReportListItem from "./ReportListItem.svelte";

  let { picked = $bindable<string[]>([]) }: { picked?: string[] } = $props();

  function toggle(id: string): void {
    picked = picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id];
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
  <div class="flex flex-wrap gap-2">
    <Button size="sm" variant="outline" onclick={load}>Load report file</Button>
    <Button size="sm" variant="ghost" onclick={() => (picked = [])}>Use all</Button>
  </div>

  <div class="flex max-h-[26rem] flex-col gap-2 overflow-y-auto lg:max-h-[34rem]">
    {#each app.reports as report (report.id)}
      <ReportListItem
        {report}
        picked={picked.includes(report.id)}
        ontoggle={() => toggle(report.id)}
        onsave={() => saveOne(report.id)}
        onremove={() => remove(report.id)}
      />
    {:else}
      <p class="py-8 text-center text-sm text-muted-foreground">
        No reports yet. Finish a run and it lands here.
      </p>
    {/each}
  </div>
</div>
