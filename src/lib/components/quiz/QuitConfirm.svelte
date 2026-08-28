<script lang="ts">
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";

  // Confirmation shown before an unfinished run is discarded.

  let keep = $state<HTMLDivElement | null>(null);

  const answered = $derived(app.answers.length);
  const left = $derived(Math.max(0, app.questions.length - answered));

  // focus the keep button rather than the discard button
  $effect(() => {
    keep?.querySelector("button")?.focus();
  });

  function keydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      app.cancelQuit();
    }
  }
</script>

<svelte:window onkeydown={keydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <button
    type="button"
    class="absolute inset-0 cursor-default bg-foreground/40"
    aria-label="Keep going"
    onclick={() => app.cancelQuit()}
  ></button>

  <div
    class="anim-pop relative flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-surface p-5 sm:p-6"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="quit-title"
    aria-describedby="quit-body"
  >
    <div class="flex flex-col gap-2">
      <h2 id="quit-title" class="text-h3 font-bold leading-tight">Stop this run?</h2>
      <p id="quit-body" class="text-sm leading-snug text-muted-foreground">
        {#if answered === 0}
          You have not answered anything yet. Nothing will be saved.
        {:else}
          Only a finished run is scored. Your
          <span class="font-semibold text-foreground">
            {answered}
            {answered === 1 ? "answer" : "answers"}
          </span>
          will be thrown away, with no report and no score for it.
        {/if}
      </p>
      {#if left > 0 && answered > 0}
        <p class="text-sm leading-snug text-muted-foreground">
          {left}
          {left === 1 ? "question" : "questions"} left to go.
        </p>
      {/if}
    </div>

    <div class="flex flex-col-reverse gap-2 sm:flex-row">
      <Button variant="danger" full onclick={() => app.quit()}>Stop and discard</Button>
      <div bind:this={keep} class="w-full">
        <Button variant="brand" full onclick={() => app.cancelQuit()}>Keep going</Button>
      </div>
    </div>
  </div>
</div>
