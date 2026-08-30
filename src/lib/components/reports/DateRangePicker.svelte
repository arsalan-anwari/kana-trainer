<script lang="ts">
  import { untrack } from "svelte";
  import { dayKey, rangeDays, type DateRange } from "../../core/report";
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

  // seeded once: the panel is built fresh each time it opens
  let from = $state(untrack(() => current?.from) ?? earliest);
  let to = $state(untrack(() => current?.to) ?? today);

  // the keys sort the same as the dates they name, so string compare is enough
  const valid = $derived(from >= earliest && to <= today && from <= to);

  const field =
    "w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:border-foreground";

  function keydown(event: KeyboardEvent): void {
    if (event.key === "Escape") onclose();
  }
</script>

<svelte:window onkeydown={keydown} />

{#snippet body()}
  <label class="flex flex-col gap-1">
    <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">From</span>
    <input type="date" bind:value={from} min={earliest} max={today} class={field} />
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">To</span>
    <input type="date" bind:value={to} min={earliest} max={today} class={field} />
  </label>

  {#if !valid}
    <p class="text-xs font-semibold text-danger">
      Pick a start on or before the end, no earlier than {earliest}.
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
    class="fixed inset-0 z-50 flex flex-col bg-background pt-[env(safe-area-inset-top,0px)]"
    role="dialog"
    aria-modal="true"
    aria-label="Pick a date range"
  >
    <header class="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <span class="text-h4 font-bold">Date range</span>
      <IconButton icon="close" label="Close the date range" onclick={onclose} />
    </header>

    <div class="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
      {@render body()}
    </div>
  </div>
{/if}
