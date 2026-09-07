<script lang="ts">
  import type { Script } from "../../core/kana";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { Card, Icon, OptionCard } from "kaizen-ui";

  function toggle(script: Script): void {
    const set = new Set(app.settings.scripts);
    if (set.has(script)) set.delete(script);
    else set.add(script);
    app.updateSettings({ scripts: [...set] as Script[] });
  }
</script>

<Card title={t("setup.alphabets.title")} description={t("setup.alphabets.description")}>
  {#snippet icon()}<Icon name="sprout" class="size-5" />{/snippet}
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <OptionCard
      label={t("common.hiragana")}
      hint="あ い う え お"
      active={app.settings.scripts.includes("hiragana")}
      onclick={() => toggle("hiragana")}
    />
    <OptionCard
      label={t("common.katakana")}
      hint="ア イ ウ エ オ"
      active={app.settings.scripts.includes("katakana")}
      onclick={() => toggle("katakana")}
    />
  </div>
</Card>
