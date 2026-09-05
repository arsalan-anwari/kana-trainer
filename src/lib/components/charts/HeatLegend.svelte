<script lang="ts">
  // What the tint means, once per card.
  let { class: className = "" }: { class?: string } = $props();
</script>

<div
  class="flex items-center justify-end gap-2 text-[0.625rem] text-muted-foreground {className}"
>
  <span class="tabular-nums">0%</span>
  <span
    class="h-1.5 w-16 rounded-full sm:w-24"
    style="background: linear-gradient(to right, var(--color-danger), var(--color-success))"
    aria-hidden="true"
  ></span>
  <span class="tabular-nums">100%</span>
</div>
