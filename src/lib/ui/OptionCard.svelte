<script lang="ts">
  import { sfx } from "../audio";

  let {
    active = false,
    disabled = false,
    label,
    hint = "",
    onclick
  }: {
    active?: boolean;
    disabled?: boolean;
    label: string;
    hint?: string;
    onclick?: () => void;
  } = $props();

  function handle(): void {
    if (!disabled) sfx.select();
    onclick?.();
  }
</script>

<button
  type="button"
  {disabled}
  aria-pressed={active}
  class="flex h-full w-full cursor-pointer flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 sm:p-4 {active
    ? 'border-selected bg-selected-soft'
    : 'border-border bg-surface hover:bg-accent'} active:translate-y-[1px]"
  onclick={handle}
>
  <span class="flex items-center gap-2 text-sm font-semibold leading-tight">
    <span
      class="inline-block size-2 rounded-full {active ? 'bg-selected' : 'bg-border'}"
      aria-hidden="true"
    ></span>
    {label}
  </span>
  {#if hint !== ""}
    <span class="text-xs leading-snug text-muted-foreground">{hint}</span>
  {/if}
</button>
