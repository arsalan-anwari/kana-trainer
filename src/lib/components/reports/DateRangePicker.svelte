<script lang="ts">
  import { untrack } from "svelte";
  import { dayKey, rangeDays, type DateRange } from "../../core/report";
  import { i18n, t } from "../../i18n.svelte";
  import { Button, Calendar, Popover } from "kaizen-ui";

  let {
    anchor,
    current,
    onpick,
    onclose
  }: {
    anchor: HTMLElement | null;
    current: DateRange | null;
    onpick: (range: DateRange) => void;
    onclose: () => void;
  } = $props();

  const today = dayKey(Date.now());
  const earliest = dayKey(Date.now() - rangeDays * 24 * 60 * 60 * 1000);

  let from = $state(untrack(() => current?.from) ?? "");
  let to = $state(untrack(() => current?.to) ?? today);
  let end = $state<"from" | "to">("from");

  const valid = $derived(from >= earliest && to <= today && from <= to);

  function dayText(key: string): string {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
    return parts === null
      ? "—"
      : new Date(
          Number(parts[1]),
          Number(parts[2]) - 1,
          Number(parts[3])
        ).toLocaleDateString(i18n.locale);
  }

  // Picking one end drags the other along rather than leaving a backwards range.
  function pick(day: string): void {
    if (end === "from") {
      from = day;
      if (to < day) to = day;
      end = "to";
    } else {
      to = day;
      if (day < from) from = day;
    }
  }

  const tab =
    "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors";
</script>

<Popover
  {anchor}
  width={19}
  label={t("reports.range.title")}
  closeLabel={t("reports.range.close")}
  {onclose}
>
  {#snippet children()}
    <div class="flex flex-col gap-3">
      <div class="grid grid-cols-2 gap-2">
        {#each ["from", "to"] as const as which (which)}
          <button
            type="button"
            aria-pressed={end === which}
            class="{tab} {end === which
              ? 'border-selected bg-selected-soft'
              : 'border-wire bg-surface hover:border-selected'}"
            onclick={() => (end = which)}
          >
            <span class="text-[0.625rem] font-bold uppercase tracking-wide text-muted-foreground">
              {t(`reports.range.${which}`)}
            </span>
            <span class="text-sm font-bold tabular-nums">
              {dayText(which === "from" ? from : to)}
            </span>
          </button>
        {/each}
      </div>

      <Calendar
        value={end === "from" ? from : to}
        min={earliest}
        max={today}
        onpick={pick}
      />

      {#if !valid && from !== ""}
        <p class="text-xs font-semibold text-danger">
          {t("reports.range.invalid", { earliest: dayText(earliest) })}
        </p>
      {/if}

      <div class="flex gap-2">
        <Button variant="outline" full onclick={onclose}>{t("common.cancel")}</Button>
        <Button variant="brand" full disabled={!valid} onclick={() => onpick({ from, to })}>
          {t("common.apply")}
        </Button>
      </div>
    </div>
  {/snippet}
</Popover>
