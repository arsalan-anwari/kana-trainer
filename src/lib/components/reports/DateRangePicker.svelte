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
  import { viewport } from "../../viewport.svelte";
  import Button from "../../ui/Button.svelte";
  import IconButton from "../../ui/IconButton.svelte";

  // Picks the window by hand. Full screen on a phone, an overlay hanging under
  // the filters on anything wider.

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
  // a year back is as far as the window reaches
  const earliest = dayKey(Date.now() - rangeDays * 24 * 60 * 60 * 1000);

  // seeded once: the panel is built fresh each time it opens. From starts empty
  // so the reader names a start rather than deleting the one we guessed.
  let from = $state(untrack(() => current?.from) ?? "");
  let to = $state(untrack(() => current?.to) ?? today);

  // an unfinished or impossible day reads as "", which fails every compare below.
  // the keys sort the same as the dates they name, so string compare is enough
  const valid = $derived(from >= earliest && to <= today && from <= to);

  // The desktop webview's date popup is a cramped calendar with no keyboard path,
  // so type the day there and leave the native picker to touch devices.
  const touch = $derived(
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );

  // what the typed fields show, kept beside the keys they parse into
  let fromText = $state(dayInputText(untrack(() => current?.from) ?? ""));
  let toText = $state(dayInputText(untrack(() => current?.to) ?? today));

  // Rewrites the field to DD/MM/YYYY on every keystroke and drops the caret back
  // after the digit it was behind, so inserting or erasing mid string stays put.
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
    // a focused button answers Enter on its own, so leave that one alone
    if (event.key === "Enter" && valid && !(event.target instanceof HTMLButtonElement)) {
      onpick({ from, to });
    }
  }
</script>

<svelte:window onkeydown={keydown} />

{#snippet body()}
  <label class="flex flex-col gap-1">
    <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">From</span>
    {#if touch}
      <input type="date" bind:value={from} min={earliest} max={today} class={field} />
    {:else}
      <input
        type="text"
        value={fromText}
        oninput={(event) => type(event, "from")}
        inputmode="numeric"
        maxlength="10"
        placeholder="DD/MM/YYYY"
        autocomplete="off"
        spellcheck="false"
        class={field}
      />
    {/if}
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">To</span>
    {#if touch}
      <input type="date" bind:value={to} min={earliest} max={today} class={field} />
    {:else}
      <input
        type="text"
        value={toText}
        oninput={(event) => type(event, "to")}
        inputmode="numeric"
        maxlength="10"
        placeholder="DD/MM/YYYY"
        autocomplete="off"
        spellcheck="false"
        class={field}
      />
    {/if}
  </label>

  {#if !valid && (from !== "" || fromText !== "")}
    <p class="text-xs font-semibold text-danger">
      {#if touch}
        Pick a start on or before the end, no earlier than {earliest}.
      {:else}
        Use DD/MM/YYYY, start on or before the end, no earlier than {dayInputText(earliest)}.
      {/if}
    </p>
  {/if}

  <div class="flex gap-2">
    <Button variant="outline" full onclick={onclose}>Cancel</Button>
    <Button variant="brand" full disabled={!valid} onclick={() => onpick({ from, to })}>
      Apply
    </Button>
  </div>
{/snippet}

{#if viewport.wide}
  <div
    class="anim-pop absolute inset-x-0 top-full z-40 mt-2 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-lg"
    role="dialog"
    aria-modal="true"
    aria-label="Pick a date range"
  >
    {@render body()}
  </div>
{:else}
  <div
    class="fixed inset-0 z-50 flex flex-col bg-background pt-[env(safe-area-inset-top,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
    role="dialog"
    aria-modal="true"
    aria-label="Pick a date range"
  >
    <header class="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <span class="text-h4 font-bold">Date range</span>
      <IconButton icon="close" label="Close the date range" onclick={onclose} />
    </header>

    <div
      class="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]"
    >
      {@render body()}
    </div>
  </div>
{/if}
