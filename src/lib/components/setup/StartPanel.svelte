<script lang="ts">
  import { Button, Icon, Stat } from "kaizen-ui";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
</script>

<div
  class="sheet ruled flex flex-col gap-3 rounded-2xl border-2 border-border bg-sidebar p-4 sm:p-5"
>
  <div class="grid grid-cols-2 gap-2">
    <Stat
      icon="target"
      tone="brand"
      value={app.eligibleCount}
      label={t("setup.start.inPlayShort")}
    />
    <Stat
      icon="sprout"
      tone="seal"
      value={app.settings.questionCount === 0 ? app.eligibleCount : app.settings.questionCount}
      label={t("setup.start.questions")}
    />
  </div>

  {#if app.notes.length > 0}
    <ul class="flex flex-col gap-1">
      {#each app.notes as note (note)}
        <li class="flex items-start gap-1.5 text-xs leading-snug text-muted-foreground">
          <Icon name="info" class="mt-0.5 size-3.5 shrink-0" />
          {t(note)}
        </li>
      {/each}
    </ul>
  {/if}

  {#if app.message !== ""}
    <p class="text-xs font-bold leading-snug text-success">{app.message}</p>
  {/if}

  <Button
    size="xl"
    variant="brand"
    full
    disabled={app.eligibleCount === 0}
    onclick={() => app.start()}
  >
    {t("setup.start.button")}
  </Button>
</div>
