<script lang="ts">
  import type { Snippet } from "svelte";
  import { sfx } from "../audio";

  let {
    active = false,
    disabled = false,
    size = "md",
    title = "",
    class: className = "",
    onclick,
    children
  }: {
    active?: boolean;
    disabled?: boolean;
    size?: "sm" | "md";
    title?: string;
    class?: string;
    onclick?: () => void;
    children: Snippet;
  } = $props();

  const sizes = {
    sm: "h-9 min-w-9 px-2 text-xs rounded-md",
    md: "h-12 min-w-12 px-1 text-sm rounded-lg"
  };

  function handle(): void {
    if (!disabled) sfx.select();
    onclick?.();
  }
</script>

<button
  type="button"
  {title}
  {disabled}
  aria-pressed={active}
  class="inline-flex cursor-pointer items-center justify-center font-semibold transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30 {sizes[
    size
  ]} {className} {active
    ? 'border-2 border-brand bg-brand/15 text-foreground shadow-[0_3px_0_var(--color-brand-shadow)] active:translate-y-[3px] active:shadow-none'
    : 'border border-border bg-background text-muted-foreground hover:bg-accent active:translate-y-[2px]'}"
  onclick={handle}
>
  {@render children()}
</button>
