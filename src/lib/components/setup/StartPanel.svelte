<script lang="ts">
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import { t } from "../../i18n.svelte";
</script>

<div class="flex flex-col gap-3 rounded-xl border border-border bg-sidebar p-4">
  {#if app.notes.length > 0}
    <ul class="flex flex-col gap-1">
      {#each app.notes as note (note)}
        <li class="text-xs leading-snug text-muted-foreground">{t(note)}</li>
      {/each}
    </ul>
  {/if}
  {#if app.message !== ""}
    <p class="text-xs font-semibold leading-snug text-success">{app.message}</p>
  {/if}
  <div class="flex items-center justify-between text-sm">
    <span class="text-muted-foreground">{t("setup.start.inPlay")}</span>
    <span class="font-semibold">{app.eligibleCount}</span>
  </div>
  <Button
    size="lg"
    variant="brand"
    full
    disabled={app.eligibleCount === 0}
    onclick={() => app.start()}
  >
    {t("setup.start.button")}
  </Button>
</div>
