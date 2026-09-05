<script lang="ts">
  import type { Format } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import OptionCard from "../../ui/OptionCard.svelte";
  import { t } from "../../i18n.svelte";

  const formats: Format[] = ["text-text", "audio-text", "text-audio"];
</script>

<Card title={t("setup.format.title")} description={t("setup.format.description")}>
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
