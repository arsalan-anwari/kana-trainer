<script lang="ts">
  import type { Snippet } from "svelte";
  import { sfx } from "../audio";

  type Variant = "primary" | "brand" | "secondary" | "outline" | "ghost" | "danger";
  type Size = "sm" | "md" | "lg" | "xl";

  let {
    variant = "primary",
    size = "md",
    disabled = false,
    type = "button",
    title = "",
    full = false,
    silent = false,
    class: className = "",
    onclick,
    children
  }: {
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    type?: "button" | "submit";
    title?: string;
    full?: boolean;
    silent?: boolean;
    class?: string;
    onclick?: () => void;
    children: Snippet;
  } = $props();

  const base =
    "inline-flex items-center justify-center gap-2 font-semibold select-none cursor-pointer transition-[transform,box-shadow,background-color,color] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40";

  const variants: Record<Variant, string> = {
    primary:
      "bg-primary text-primary-foreground shadow-[0_4px_0_var(--color-border)] hover:brightness-110 active:translate-y-[4px] active:shadow-none",
    brand:
      "bg-brand text-brand-foreground shadow-[0_4px_0_var(--color-brand-shadow)] hover:brightness-105 active:translate-y-[4px] active:shadow-none",
    secondary:
      "bg-secondary text-secondary-foreground shadow-[0_4px_0_var(--color-border)] hover:brightness-105 active:translate-y-[4px] active:shadow-none",
    outline:
      "border border-border bg-background text-foreground hover:bg-accent active:translate-y-[2px]",
    ghost: "text-foreground hover:bg-accent active:translate-y-[2px]",
    danger:
      "bg-danger text-danger-foreground shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:brightness-110 active:translate-y-[4px] active:shadow-none"
  };

  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm rounded-md",
    md: "h-11 px-5 text-sm rounded-lg",
    lg: "h-14 px-8 text-h4 rounded-xl",
    xl: "h-16 px-10 text-h3 rounded-xl"
  };

  function handle(): void {
    if (!silent) sfx.click();
    onclick?.();
  }
</script>

<button
  {type}
  {title}
  {disabled}
  class="{base} {variants[variant]} {sizes[size]} {full ? 'w-full' : ''} {className}"
  onclick={handle}
>
  {@render children()}
</button>
