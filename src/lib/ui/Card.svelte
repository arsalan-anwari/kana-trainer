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

<section class="rounded-xl border border-border bg-surface {className}">
  {#if title !== "" || action}
    <header class="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 pb-3 sm:px-5">
      <div class="flex flex-col gap-1">
        <h3 class="text-h4 font-semibold leading-tight tracking-tight">{title}</h3>
        {#if description !== ""}
          <p class="text-sm leading-snug text-muted-foreground">{description}</p>
        {/if}
      </div>
      {#if action}
        <div class="flex shrink-0 items-center gap-2">{@render action()}</div>
      {/if}
    </header>
  {/if}
  <div class="px-4 pb-4 sm:px-5 sm:pb-5 {contentClass}">
    {@render children()}
  </div>
</section>
