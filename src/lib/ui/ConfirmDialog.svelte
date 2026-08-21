<script lang="ts">
  import type { Snippet } from "svelte";
  import Button from "./Button.svelte";

  let {
    title,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onconfirm,
    oncancel,
    children
  }: {
    title: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onconfirm: () => void;
    oncancel: () => void;
    children?: Snippet;
  } = $props();

  let safe = $state<HTMLDivElement | null>(null);

  $effect(() => {
    safe?.querySelector("button")?.focus();
  });

  function keydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      oncancel();
    }
  }
</script>

<svelte:window onkeydown={keydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <button
    type="button"
    class="absolute inset-0 cursor-default bg-foreground/40"
    aria-label="Close"
    onclick={oncancel}
  ></button>

  <div
    class="anim-pop relative flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-surface p-5 sm:p-6"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="confirm-title"
  >
    <div class="flex flex-col gap-2">
      <h2 id="confirm-title" class="text-h3 font-bold leading-tight">{title}</h2>
      {#if children}
        <div class="text-sm leading-snug text-muted-foreground">{@render children()}</div>
      {/if}
    </div>

    <div class="flex flex-col-reverse gap-2 sm:flex-row">
      <Button variant="danger" full onclick={onconfirm}>{confirmLabel}</Button>
      <div bind:this={safe} class="w-full">
        <Button variant="brand" full onclick={oncancel}>{cancelLabel}</Button>
      </div>
    </div>
  </div>
</div>
