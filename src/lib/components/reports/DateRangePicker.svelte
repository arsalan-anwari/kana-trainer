<script lang="ts">
  import { untrack } from "svelte";
  import {
    dayInputText,
    dayKey,
    dayKeyFromInput,
    maskDay,
    rangeDays,
    type DateRange
  } from "../../core/report";
  import { t } from "../../i18n.svelte";
  import { Button, IconButton, viewport } from "kaizen-ui";

  let {
    current,
    onpick,
    onclose
  }: {
    current: DateRange | null;
    onpick: (range: DateRange) => void;
    onclose: () => void;
  } = $props();

  const today = dayKey(Date.now());
  const earliest = dayKey(Date.now() - rangeDays * 24 * 60 * 60 * 1000);

  let from = $state(untrack(() => current?.from) ?? "");
  let to = $state(untrack(() => current?.to) ?? today);

  const valid = $derived(from >= earliest && to <= today && from <= to);

  const touch = $derived(
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );

  let fromText = $state(dayInputText(untrack(() => current?.from) ?? ""));
  let toText = $state(dayInputText(untrack(() => current?.to) ?? today));

  function type(event: Event & { currentTarget: HTMLInputElement }, end: "from" | "to"): void {
    const input = event.currentTarget;
    const typed = input.value.slice(0, input.selectionStart ?? input.value.length);
    const digits = typed.replace(/\D/g, "").length;

    const text = maskDay(input.value);
    let caret = 0;
    for (let seen = 0; caret < text.length && seen < digits; caret += 1) {
      if (text[caret] !== "/") seen += 1;
    }
    input.value = text;
    input.setSelectionRange(caret, caret);

    if (end === "from") {
      fromText = text;
      from = dayKeyFromInput(text);
    } else {
      toText = text;
      to = dayKeyFromInput(text);
    }
  }

  const field =
    "w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:border-foreground";

  function keydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      onclose();
      return;
    }
    if (event.key === "Enter" && valid && !(event.target instanceof HTMLButtonElement)) {
      onpick({ from, to });
    }
  }
</script>

<svelte:window onkeydown={keydown} />

{#snippet body()}
  <label class="flex flex-col gap-1">
    <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("reports.range.from")}</span>
    {#if touch}
      <input type="date" bind:value={from} min={earliest} max={today} class={field} />
    {:else}
      <input
        type="text"
        value={fromText}
        oninput={(event) => type(event, "from")}
        inputmode="numeric"
        maxlength="10"
        placeholder={t("reports.range.mask")}
        autocomplete="off"
        spellcheck="false"
        class={field}
      />
    {/if}
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("reports.range.to")}</span>
    {#if touch}
      <input type="date" bind:value={to} min={earliest} max={today} class={field} />
    {:else}
      <input
        type="text"
        value={toText}
        oninput={(event) => type(event, "to")}
        inputmode="numeric"
        maxlength="10"
        placeholder={t("reports.range.mask")}
        autocomplete="off"
        spellcheck="false"
        class={field}
      />
    {/if}
  </label>

  {#if !valid && (from !== "" || fromText !== "")}
    <p class="text-xs font-semibold text-danger">
      {#if touch}
        {t("reports.range.invalidPicked", { earliest })}
      {:else}
        {t("reports.range.invalidTyped", { earliest: dayInputText(earliest) })}
      {/if}
    </p>
  {/if}

  <div class="flex gap-2">
    <Button variant="outline" full onclick={onclose}>{t("common.cancel")}</Button>
    <Button variant="brand" full disabled={!valid} onclick={() => onpick({ from, to })}>
      {t("common.apply")}
    </Button>
  </div>
{/snippet}

{#if viewport.wide}
  <div
    class="anim-pop absolute inset-x-0 top-full z-40 mt-2 flex flex-col gap-3 rounded-xl border-2 border-border bg-surface p-4 shadow-lg"
    role="dialog"
    aria-modal="true"
    aria-label={t("reports.range.pick")}
  >
    {@render body()}
  </div>
{:else}
  <div
    class="fixed inset-0 z-50 flex flex-col paper pt-[calc(env(safe-area-inset-top,0px)+var(--edge-y,0.75rem))] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
    role="dialog"
    aria-modal="true"
    aria-label={t("reports.range.pick")}
  >
    <header class="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <span class="text-h4 font-bold">{t("reports.range.title")}</span>
      <IconButton icon="close" label={t("reports.range.close")} onclick={onclose} />
    </header>

    <div
      class="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]"
    >
      {@render body()}
    </div>
  </div>
{/if}
