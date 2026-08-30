<script lang="ts">
  import type { Snippet } from "svelte";

  // The square wireframe frame the question sits in.

  let {
    size = "md",
    class: className = "",
    children
  }: { size?: "md" | "lg"; class?: string; children: Snippet } = $props();

  // capped against the short side too, so a phone in landscape or with the
  // keyboard up shrinks the frame instead of pushing the answers off screen
  const sizes = {
    md: "size-[min(11rem,20dvh)] sm:size-44 lg:size-52",
    lg: "size-[min(14rem,24dvh)] sm:size-56 lg:size-64"
  };
</script>

<!-- a container, so what is inside can size itself against the frame -->
<div
  class="@container relative grid shrink-0 place-items-center rounded-2xl border-2 border-wire bg-surface {sizes[
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
