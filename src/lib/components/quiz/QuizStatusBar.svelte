<script lang="ts">
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { Badge, Button, Progress } from "kaizen-ui";

  const totalLabel = $derived.by(() => {
    if (app.totalRemaining === null) return null;
    const seconds = Math.ceil(app.totalRemaining / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
  });
</script>

<div class="flex flex-col gap-1.5 sm:gap-3">
  <div class="flex items-center gap-2 sm:gap-3">
    <Button size="sm" variant="ghost" onclick={() => app.askQuit()}>{t("quiz.quit")}</Button>
    <Progress value={app.progress} tone="success" size="lg" class="flex-1" />
    <span class="shrink-0 text-sm font-semibold tabular-nums">
      {app.index + 1} / {app.questions.length}
    </span>
    {#if totalLabel !== null}
      <span
        class="shrink-0 rounded-md px-2 py-1 text-xs font-semibold tabular-nums {(app.totalRemaining ?? 0) < 15000
          ? 'bg-danger-soft text-danger'
          : 'bg-secondary'}"
      >
        {totalLabel}
      </span>
    {/if}
  </div>
  <span class="px-1">
    <Badge tone={app.score > 0 ? "success" : "outline"}>
      <span class="tabular-nums">{t("quiz.score", { count: app.score })}</span>
    </Badge>
  </span>
</div>
