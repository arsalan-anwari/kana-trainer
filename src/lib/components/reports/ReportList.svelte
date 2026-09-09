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
  import { deleteReport, exportReports, importReports } from "../../storage";
  import DateRangePicker from "./DateRangePicker.svelte";
  import ReportListItem from "./ReportListItem.svelte";
  import { t } from "../../i18n.svelte";
  import { Button, Chip, ConfirmDialog, EmptyState, Icon, Popover, type IconName } from "kaizen-ui";

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
  let acting = $state(false);
  let rangeAnchor = $state<HTMLElement | null>(null);
  let actionAnchor = $state<HTMLElement | null>(null);

  const range = $derived(isDateRange(query.window) ? query.window : null);
  const active = $derived(queryTagCount(query));

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
      if (!(await exportReports(target))) return;
      const runs = t("reports.runs", { count: target.length });
      app.message = t("reports.exported", { runs });
    } catch {
      app.message = t("common.file.writeFailed");
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
  type Action = {
    icon: IconName;
    label: string;
    disabled: boolean;
    danger?: boolean;
    run: () => void;
  };

  const actions = $derived<Action[]>([
    {
      icon: "download",
      label: t("reports.list.export", { target: targetLabel }),
      disabled: target.length === 0,
      run: save
    },
    {
      icon: "folder-open",
      label: t("reports.list.import"),
      disabled: false,
      run: load
    },
    {
      icon: "trash",
      label: t("reports.list.remove", { target: targetLabel }),
      disabled: target.length === 0,
      danger: true,
      run: () => (confirming = true)
    }
  ]);
</script>

<div class="flex flex-col gap-3">
  
  <div class="flex flex-wrap items-center gap-1.5">
    {#each reportFilters as option (option)}
      <Chip size="sm" active={query.window === option} onclick={() => setWindow(option)}>
        {reportFilterLabel(option)}
      </Chip>
    {/each}
    
    <span bind:this={rangeAnchor} class="inline-flex">
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
    </span>

    {#if picking}
      <DateRangePicker
        anchor={rangeAnchor}
        current={range}
        onpick={(next) => setWindow(next)}
        onclose={() => (picking = false)}
      />
    {/if}
  </div>

  
  <details class="rounded-xl border-2 border-border bg-surface">
    <summary
      class="flex h-13 cursor-pointer list-none items-center gap-2 px-3.5 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden"
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
    
    <button
      type="button"
      class="flex min-w-0 cursor-pointer items-center gap-2 rounded-lg py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-40"
      disabled={reports.length === 0}
      aria-pressed={allPicked}
      aria-label={t(allPicked ? "reports.list.clearSelection" : "reports.list.selectAll")}
      onclick={() => (picked = allPicked ? [] : reports.map((report) => report.id))}
    >
      <span
        class="flex size-5 shrink-0 items-center justify-center rounded border-2 {picked.length === 0
          ? 'border-border'
          : 'border-selected bg-selected-soft text-selected'}"
        aria-hidden="true"
      >
        {#if allPicked}
          <Icon name="check" class="size-3.5" />
        {:else if picked.length > 0}
          <span class="h-0.5 w-2.5 rounded-full bg-selected"></span>
        {/if}
      </span>
      <span class="truncate">
        {picked.length === 0
          ? t("reports.list.shown", { count: reports.length })
          : t("reports.list.pickedOf", { picked: picked.length, total: reports.length })}
      </span>
    </button>

    <span bind:this={actionAnchor} class="inline-flex">
      <Button size="sm" variant="outline" onclick={() => (acting = true)}>
        {t("reports.list.actions")}
        <Icon name="chevron-down" class="size-4" />
      </Button>
    </span>
  </div>

  {#if acting}
    <Popover
      anchor={actionAnchor}
      width={17}
      label={t("reports.list.actions")}
      closeLabel={t("common.close")}
      onclose={() => (acting = false)}
    >
      {#snippet children(close)}
        <div class="flex flex-col gap-1">
          {#each actions as action (action.label)}
            <button
              type="button"
              class="flex h-11 shrink-0 cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition-colors hover:bg-accent disabled:cursor-default disabled:opacity-40 {action.danger ===
              true
                ? 'text-danger'
                : ''}"
              disabled={action.disabled}
              onclick={() => {
                close();
                action.run();
              }}
            >
              <Icon name={action.icon} class="size-4.5 shrink-0" />
              <span class="min-w-0 flex-1">{action.label}</span>
            </button>
          {/each}
        </div>
      {/snippet}
    </Popover>
  {/if}

  
  <div class="sheet ruled rounded-2xl border-2 border-border bg-surface p-2 sm:p-3">
    <div class="flex max-h-100 flex-col gap-2 overflow-y-auto p-1 lg:max-h-132">
      {#each reports as report (report.id)}
        <ReportListItem
          {report}
          picked={picked.includes(report.id)}
          ontoggle={() => toggle(report.id)}
        />
      {:else}
        <EmptyState
          icon={isEmptyQuery(query) ? "sprout" : "filter"}
          title={t(isEmptyQuery(query) ? "reports.list.empty" : "reports.list.noMatch")}
        />
      {/each}
    </div>
  </div>
</div>

{#if confirming}
  <ConfirmDialog
    title={t("reports.confirm.title", { count: target.length })}
    confirmLabel={t("reports.confirm.yes", { count: target.length })}
    cancelLabel={t("reports.confirm.no", { count: target.length })}
    closeLabel={t("common.close")}
    onconfirm={removeTarget}
    oncancel={() => (confirming = false)}
  >
    {t(picked.length === 0 ? "reports.confirm.bodyShown" : "reports.confirm.bodyPicked")}
  </ConfirmDialog>
{/if}
