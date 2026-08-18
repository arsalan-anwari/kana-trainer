<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title = "",
    description = "",
    class: className = "",
    contentClass = "",
    children,
    action
  }: {
    title?: string;
    description?: string;
    class?: string;
    contentClass?: string;
    children: Snippet;
    action?: Snippet;
  } = $props();
</script>

<section class="rounded-xl border border-border bg-background shadow-sm {className}">
  {#if title !== "" || action}
    <header class="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
      <div class="flex flex-col gap-1">
        <h3 class="text-h4 font-semibold leading-none tracking-tight">{title}</h3>
        {#if description !== ""}
          <p class="text-sm leading-normal text-muted-foreground">{description}</p>
        {/if}
      </div>
      {#if action}
        <div class="flex shrink-0 items-center gap-2">{@render action()}</div>
      {/if}
    </header>
  {/if}
  <div class="px-6 pb-5 {contentClass}">
    {@render children()}
  </div>
</section>
