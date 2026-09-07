<script lang="ts">
  import type { Direction } from "../../core/settings";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { Card, Icon, OptionCard } from "kaizen-ui";

  const directions: Direction[] = ["kana-romaji", "romaji-kana", "mixed"];
</script>

<Card title={t("setup.direction.title")} description={t("setup.direction.description")}>
  {#snippet icon()}<Icon name="chevron-right" class="size-5" />{/snippet}
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {#each directions as direction (direction)}
      <OptionCard
        label={t(`common.direction.${direction}`)}
        hint={t(`setup.direction.${direction}`)}
        active={app.settings.direction === direction}
        onclick={() => app.updateSettings({ direction })}
      />
    {/each}
  </div>
</Card>
