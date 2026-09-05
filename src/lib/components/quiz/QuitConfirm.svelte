<script lang="ts">
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import { t } from "../../i18n.svelte";

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
    aria-label={t("quiz.stop.cancel")}
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
      <h2 id="quit-title" class="text-h3 font-bold leading-tight">{t("quiz.stop.title")}</h2>
      <p id="quit-body" class="text-sm leading-snug text-muted-foreground">
        {t(answered === 0 ? "quiz.stop.nothing" : "quiz.stop.discard", { count: answered })}
      </p>
      {#if left > 0 && answered > 0}
        <p class="text-sm leading-snug text-muted-foreground">
          {t("quiz.stop.left", { count: left })}
        </p>
      {/if}
    </div>

    <div class="flex flex-col-reverse gap-2 sm:flex-row">
      <Button variant="danger" full onclick={() => app.quit()}>{t("quiz.stop.confirm")}</Button>
      <div bind:this={keep} class="w-full">
        <Button variant="brand" full onclick={() => app.cancelQuit()}>{t("quiz.stop.cancel")}</Button>
      </div>
    </div>
  </div>
</div>
