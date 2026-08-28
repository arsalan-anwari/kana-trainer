<script lang="ts">
  import type { Snippet } from "svelte";
  import { sfx } from "../audio";
  import Icon from "./Icon.svelte";

  // A full width bar with its own action and a separate open button on the right.

  let {
    label,
    hint = "",
    active = false,
    open = $bindable(false),
    onpress,
    children
  }: {
    label: string;
    hint?: string;
    active?: boolean;
    open?: boolean;
    // what tapping the bar does, defaults to opening and closing it
    onpress?: () => void;
    children: Snippet;
  } = $props();

  function press(): void {
    if (onpress === undefined) {
      toggle();
      return;
    }
    onpress();
  }

  function toggle(): void {
    sfx.click();
    open = !open;
  }
</script>

<div
  class="overflow-hidden rounded-lg border transition-colors {active
    ? 'border-selected bg-selected-soft'
    : 'border-border bg-surface'}"
>
  <div class="flex items-stretch">
    <button
      type="button"
      aria-pressed={onpress === undefined ? undefined : active}
      class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onclick={press}
    >
      <span class="text-sm font-bold tracking-tight">{label}</span>
      {#if hint !== ""}
        <span class="truncate text-xs tabular-nums text-muted-foreground">{hint}</span>
      {/if}
    </button>
    <button
      type="button"
      aria-expanded={open}
      aria-label="{open ? 'Hide' : 'Show'} {label}"
      class="flex w-11 shrink-0 cursor-pointer items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onclick={toggle}
    >
      <Icon name="chevron-down" class="size-4 transition-transform {open ? 'rotate-180' : ''}" />
    </button>
  </div>

  {#if open}
    <div class="border-t border-border p-2">
      {@render children()}
    </div>
  {/if}
</div>
