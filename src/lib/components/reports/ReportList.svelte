<script lang="ts">
  import {
    alphabetFilters,
    alphabetLabel,
    answerStyleTags,
    anyQuery,
    formatTags,
    isDateRange,
    isEmptyQuery,
    queryTagCount,
    reportFilterLabel,
    reportFilters,
    tagLabel,
    type AlphabetFilter,
    type Report,
    type ReportFilter,
    type ReportQuery,
    type ReportTag
  } from "../../core/report";
  import { app } from "../../state.svelte";
  import { deleteReport, exportReports, fileLabel, importReports } from "../../storage";
  import Chip from "../../ui/Chip.svelte";
  import ConfirmDialog from "../../ui/ConfirmDialog.svelte";
  import Icon from "../../ui/Icon.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import DateRangePicker from "./DateRangePicker.svelte";
  import ReportListItem from "./ReportListItem.svelte";
  import { t } from "../../i18n.svelte";

  let {
    reports,
    picked = $bindable<string[]>([]),
    query = $bindable<ReportQuery>({ ...anyQuery })
  }: { reports: Report[]; picked?: string[]; query?: ReportQuery } = $props();

  const allPicked = $derived(
    reports.length > 0 && reports.every((report) => picked.includes(report.id))
  );

  const target = $derived(
    picked.length === 0 ? reports : reports.filter((report) => picked.includes(report.id))
  );
  const targetLabel = $derived(
    picked.length === 0
      ? t("reports.target.shown", { count: reports.length })
      : t("reports.target.picked", { count: picked.length })
  );

  let confirming = $state(false);
  let picking = $state(false);

  const range = $derived(isDateRange(query.window) ? query.window : null);
  const active = $derived(queryTagCount(query));

  // Any change to what is shown drops the selection, it named runs that may no
  // longer be in view.
  function apply(next: Partial<ReportQuery>): void {
    query = { ...query, ...next };
    picked = [];
    confirming = false;
    picking = false;
  }

  function setWindow(next: ReportFilter): void {
    apply({ window: next });
  }

  function toggleTag(tag: ReportTag): void {
    apply({
      tags: query.tags.includes(tag)
        ? query.tags.filter((item) => item !== tag)
        : [...query.tags, tag]
    });
  }

  function setAlphabet(next: AlphabetFilter): void {
    // clicking the picked one again drops back to any
    apply({ alphabet: query.alphabet === next ? "any" : next });
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
    app.message = t("reports.deleted", { count: ids.length });
  }

  async function save(): Promise<void> {
    try {
      const path = await exportReports(target);
      if (path === null) return;
      const runs = t("reports.runs", { count: target.length });
      app.message = t("reports.exported", { runs, file: fileLabel(path) });
    } catch (error) {
      app.message = error instanceof Error ? error.message : t("common.file.writeFailed");
    }
  }

  async function load(): Promise<void> {
    try {
      const result = await importReports();
      if (result === null) return;
      await app.refreshReports();
      const runs = t("reports.runs", { count: result.added });
      app.message =
        result.skipped === 0
          ? t("reports.imported", { runs })
          : t("reports.importedSome", { runs, skipped: result.skipped });
    } catch (error) {
      app.message = error instanceof Error ? error.message : t("common.file.readFailed");
    }
  }
</script>

<div class="flex flex-col gap-3">
  <!-- relative so the range panel can hang under the whole filter strip -->
  <div class="relative flex flex-wrap items-center gap-1.5">
    {#each reportFilters as option (option)}
      <Chip size="sm" active={query.window === option} onclick={() => setWindow(option)}>
        {reportFilterLabel(option)}
      </Chip>
    {/each}
    <Chip
      size="sm"
      active={range !== null}
      title={range === null ? t("reports.range.pick") : reportFilterLabel(range)}
      onclick={() => (picking = true)}
    >
      <span class="flex items-center gap-1.5">
        <Icon name="calendar" class="size-4" />
        {#if range !== null}
          <span class="tabular-nums">{reportFilterLabel(range)}</span>
        {/if}
      </span>
    </Chip>

    {#if picking}
      <DateRangePicker
        current={range}
        onpick={(next) => setWindow(next)}
        onclose={() => (picking = false)}
      />
    {/if}
  </div>

  <!-- The tags each run card already carries, turned into filters. Folded away
       by default, the window chips above are the everyday control. -->
  <details class="rounded-lg border border-border bg-surface">
    <summary
      class="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden"
    >
      <Icon name="filter" class="size-4" />
      <span>{t("reports.filters.title")}</span>
      {#if active > 0}
        <span
          class="inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.625rem] text-brand-foreground tabular-nums"
        >
          {active}
        </span>
      {/if}
      <Icon name="chevron-down" class="ml-auto size-4" />
    </summary>

    <div class="flex flex-col gap-3 border-t border-border px-3 py-3">
      <div class="flex flex-col gap-1.5">
        <span class="text-[0.625rem] font-bold uppercase tracking-wide text-muted-foreground">
          {t("reports.filters.format")}
        </span>
        <div class="flex flex-wrap gap-1.5">
          {#each formatTags as tag (tag)}
            <Chip size="sm" active={query.tags.includes(tag)} onclick={() => toggleTag(tag)}>
              {tagLabel(tag)}
            </Chip>
          {/each}
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-[0.625rem] font-bold uppercase tracking-wide text-muted-foreground">
          {t("reports.filters.answering")}
        </span>
        <div class="flex flex-wrap gap-1.5">
          {#each answerStyleTags as tag (tag)}
            <Chip size="sm" active={query.tags.includes(tag)} onclick={() => toggleTag(tag)}>
              {tagLabel(tag)}
            </Chip>
          {/each}
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-[0.625rem] font-bold uppercase tracking-wide text-muted-foreground">
          {t("reports.filters.alphabet")}
        </span>
        <div class="flex flex-wrap gap-1.5">
          {#each alphabetFilters.filter((option) => option !== "any") as option (option)}
            <Chip size="sm" active={query.alphabet === option} onclick={() => setAlphabet(option)}>
              {alphabetLabel(option)}
            </Chip>
          {/each}
        </div>
      </div>

      {#if active > 0}
        <button
          type="button"
          class="self-start text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
          onclick={() => apply({ tags: [], alphabet: "any" })}
        >
          {t("reports.filters.clear")}
        </button>
      {/if}
    </div>
  </details>

  <div class="flex items-center justify-between gap-2">
    <span class="hidden text-xs text-muted-foreground sm:inline">
      {picked.length === 0
        ? t("reports.list.shown", { count: reports.length })
        : t("reports.list.pickedOf", { picked: picked.length, total: reports.length })}
    </span>
    <div class="flex items-center gap-1.5">
      <IconButton
        size="sm"
        icon="select-all"
        label={t("reports.list.selectAll")}
        disabled={reports.length === 0 || allPicked}
        onclick={() => (picked = reports.map((report) => report.id))}
      />
      <IconButton
        size="sm"
        icon="select-none"
        label={t("reports.list.clearSelection")}
        disabled={picked.length === 0}
        onclick={() => (picked = [])}
      />
      <IconButton
        size="sm"
        icon="trash"
        label={t("reports.list.remove", { target: targetLabel })}
        disabled={target.length === 0}
        onclick={() => (confirming = true)}
      />
      <IconButton
        size="sm"
        icon="download"
        label={t("reports.list.export", { target: targetLabel })}
        disabled={target.length === 0}
        onclick={save}
      />
      <IconButton
        size="sm"
        icon="folder-open"
        label={t("reports.list.import")}
        onclick={load}
      />
    </div>
  </div>

  <div class="flex max-h-104 flex-col gap-2 overflow-y-auto lg:max-h-136">
    {#each reports as report (report.id)}
      <ReportListItem
        {report}
        picked={picked.includes(report.id)}
        ontoggle={() => toggle(report.id)}
      />
    {:else}
      <p class="py-8 text-center text-sm text-muted-foreground">
        {t(isEmptyQuery(query) ? "reports.list.empty" : "reports.list.noMatch")}
      </p>
    {/each}
  </div>
</div>

{#if confirming}
  <ConfirmDialog
    title={t("reports.confirm.title", { count: target.length })}
    confirmLabel={t("reports.confirm.yes", { count: target.length })}
    cancelLabel={t("reports.confirm.no", { count: target.length })}
    onconfirm={removeTarget}
    oncancel={() => (confirming = false)}
  >
    {t(picked.length === 0 ? "reports.confirm.bodyShown" : "reports.confirm.bodyPicked")}
  </ConfirmDialog>
{/if}
