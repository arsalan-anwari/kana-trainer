<script lang="ts">
  import { sfx } from "../audio";
  import Icon from "./Icon.svelte";
  import type { IconName } from "./icons";

  /** A square button carrying one icon. The label is what a screen reader gets. */

  let {
    icon,
    label,
    active = false,
    disabled = false,
    size = "md",
    variant = "outline",
    class: className = "",
    onclick
  }: {
    icon: IconName;
    label: string;
    active?: boolean;
    disabled?: boolean;
    size?: "sm" | "md";
    variant?: "outline" | "ghost";
    class?: string;
    onclick?: () => void;
  } = $props();

  const sizes = {
    sm: "size-9 rounded-md",
    md: "size-11 rounded-lg"
  };

  function handle(): void {
    if (disabled) return;
    sfx.click();
    onclick?.();
  }
</script>

<button
  type="button"
  title={label}
  aria-label={label}
  aria-pressed={active}
  {disabled}
  class="inline-flex shrink-0 cursor-pointer items-center justify-center transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 {sizes[
    size
  ]} {className} {active
    ? 'border-2 border-foreground bg-foreground/10 text-foreground'
    : variant === 'ghost'
      ? 'text-muted-foreground hover:bg-accent hover:text-foreground active:translate-y-[1px]'
      : 'border border-border bg-surface text-muted-foreground hover:bg-accent hover:text-foreground active:translate-y-[1px]'}"
  onclick={handle}
>
  <Icon name={icon} class={size === "sm" ? "size-4" : "size-5"} />
</button>
