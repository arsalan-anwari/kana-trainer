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
  class="flex w-full cursor-pointer flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 {active
    ? 'border-brand bg-brand/10 shadow-[0_3px_0_var(--color-brand-shadow)]'
    : 'border-border bg-background hover:bg-accent'} active:translate-y-[2px]"
  onclick={handle}
>
  <span class="text-sm font-semibold leading-tight">{label}</span>
  {#if hint !== ""}
    <span class="text-xs leading-snug text-muted-foreground">{hint}</span>
  {/if}
</button>
