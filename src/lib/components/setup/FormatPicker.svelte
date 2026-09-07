<script lang="ts">
  import type { Format } from "../../core/settings";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { Card, Icon, OptionCard } from "kaizen-ui";

  const formats: Format[] = ["text-text", "audio-text", "text-audio"];
</script>

<Card title={t("setup.format.title")} description={t("setup.format.description")}>
  {#snippet icon()}<Icon name="volume-on" class="size-5" />{/snippet}
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {#each formats as format (format)}
      <OptionCard
        label={t(`common.format.${format}`)}
        hint={t(`setup.format.${format}`)}
        active={app.settings.format === format}
        onclick={() => app.updateSettings({ format })}
      />
    {/each}
  </div>
</Card>
