<script lang="ts">
  import { sfx } from "../audio";

  let {
    checked = false,
    disabled = false,
    label = "",
    hint = "",
    onchange
  }: {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    hint?: string;
    onchange?: (value: boolean) => void;
  } = $props();

  function toggle(): void {
    if (disabled) return;
    sfx.select();
    onchange?.(!checked);
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  {disabled}
  class="flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
  onclick={toggle}
>
  <span class="flex flex-col gap-0.5">
    <span class="text-sm font-semibold leading-tight">{label}</span>
    {#if hint !== ""}
      <span class="text-xs leading-snug text-muted-foreground">{hint}</span>
    {/if}
  </span>
  <span
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors {checked
      ? 'bg-brand'
      : 'bg-secondary'}"
  >
    <span
      class="absolute h-5 w-5 rounded-full bg-background shadow transition-transform duration-150 {checked
        ? 'translate-x-[22px]'
        : 'translate-x-[2px]'}"
    ></span>
  </span>
</button>
