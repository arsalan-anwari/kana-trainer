<script lang="ts">
  import {
    clampCustomCount,
    customCountMax,
    customCountMin,
    customCountValues,
    isCustomCount,
    questionCountRows
  } from "../../core/settings";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { Chip, NumberField, NumberRoller, viewport } from "kaizen-ui";

  let custom = $state(isCustomCount(app.settings.questionCount));
  let rolling = $state(false);

  const roller = $derived(viewport.touch && !viewport.short);

  function choose(count: number): void {
    custom = false;
    app.updateSettings({ questionCount: count });
  }

  function openCustom(): void {
    custom = true;
    const start = clampCustomCount(app.settings.questionCount || customCountMin);
    if (roller) {
      rolling = true;
      return;
    }
    app.updateSettings({ questionCount: start });
  }

  function picked(value: number): void {
    rolling = false;
    app.updateSettings({ questionCount: value });
  }
</script>

<div class="flex flex-col gap-2">
  {#each questionCountRows as row, index (index)}
    <div class="grid grid-cols-5 gap-2">
      {#each row as count (count)}
        <Chip
          size="sm"
          class="w-full"
          active={!custom && app.settings.questionCount === count}
          onclick={() => choose(count)}
        >
          {count}
        </Chip>
      {/each}
    </div>
  {/each}

  <div class="grid grid-cols-2 gap-2">
    {#if custom && !roller}
      <NumberField
        value={app.settings.questionCount}
        min={customCountMin}
        max={customCountMax}
        label={t("setup.questions.count")}
        focusOnMount
        class="w-full"
        oncommit={(count) => app.updateSettings({ questionCount: count })}
      />
    {:else}
      <Chip size="sm" class="w-full" active={custom} onclick={openCustom}>
        {custom ? app.settings.questionCount : t("common.custom")}
      </Chip>
    {/if}

    <Chip
      size="sm"
      class="w-full"
      active={app.settings.questionCount === 0}
      onclick={() => choose(0)}
    >
      {t("setup.questions.onePass")}
    </Chip>
  </div>
</div>

{#if rolling}
  <NumberRoller
    values={customCountValues}
    value={clampCustomCount(app.settings.questionCount || customCountMin)}
    title={t("setup.questions.count")}
    doneLabel={t("common.apply")}
    cancelLabel={t("common.cancel")}
    onpick={picked}
    onclose={() => (rolling = false)}
  />
{/if}
