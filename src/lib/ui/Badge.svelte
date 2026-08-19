<script lang="ts">
  import type { Snippet } from "svelte";

  type Tone = "default" | "outline" | "success" | "danger" | "brand";

  let {
    tone = "outline",
    class: className = "",
    children
  }: { tone?: Tone; class?: string; children: Snippet } = $props();

  const tones: Record<Tone, string> = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-border text-muted-foreground",
    success: "bg-success-soft text-success",
    danger: "bg-danger-soft text-danger",
    brand: "bg-brand text-brand-foreground"
  };
</script>

<span
  class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold {tones[tone]} {className}"
>
  {@render children()}
</span>
