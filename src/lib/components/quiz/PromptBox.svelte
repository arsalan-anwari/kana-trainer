<script lang="ts">
  import type { Snippet } from "svelte";

  /**
   * The square wireframe frame the question sits in. 
   */

  let {
    size = "md",
    class: className = "",
    children
  }: { size?: "md" | "lg"; class?: string; children: Snippet } = $props();

  const sizes = {
    md: "size-[min(11rem,20dvh)] sm:size-44 lg:size-52",
    lg: "size-36 sm:size-56 lg:size-64"
  };
</script>

<div
  class="relative grid shrink-0 place-items-center rounded-2xl border-2 border-wire bg-surface {sizes[
    size
  ]} {className}"
>
  <span class="absolute left-2 top-2 size-4 border-l-2 border-t-2 border-wire" aria-hidden="true"
  ></span>
  <span class="absolute right-2 top-2 size-4 border-r-2 border-t-2 border-wire" aria-hidden="true"
  ></span>
  <span
    class="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-wire"
    aria-hidden="true"
  ></span>
  <span
    class="absolute bottom-2 right-2 size-4 border-b-2 border-r-2 border-wire"
    aria-hidden="true"
  ></span>
  {@render children()}
</div>
