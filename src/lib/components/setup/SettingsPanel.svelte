<script lang="ts">
  import {
    customPerQuestionMax,
    customTotalMinutesMax,
    difficulties,
    difficultyLabel,
    difficultyMinPool,
    groupFlag,
    isCustomTime,
    optionalGroups,
    perQuestionOptions,
    totalTimeOptions
  } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import Chip from "../../ui/Chip.svelte";
  import CustomNumberChip from "../../ui/CustomNumberChip.svelte";
  import OptionCard from "../../ui/OptionCard.svelte";
  import Switch from "../../ui/Switch.svelte";
  import QuestionCountPicker from "./QuestionCountPicker.svelte";
  import { t } from "../../i18n.svelte";

  // tokushon has no hiragana form, so it is offered only once katakana is in the run
  const shownSets = $derived(
    optionalGroups.filter(
      (group) => group !== "tokushon" || app.settings.scripts.includes("katakana")
    )
  );

  // whether the pool is large enough for the difficulty to matter
  const enoughToSort = $derived(app.eligibleCount >= difficultyMinPool);

  function timeLabel(seconds: number): string {
    if (seconds === 0) return t("common.off");
    if (seconds < 60) return `${seconds}s`;
    return `${seconds / 60}m`;
  }

  // Whether the custom chip is the one holding the timer. Held rather than
  // derived, a hand picked 60s is the same number as the 1m preset and the chip
  // still has to stay the one lit.
  let perQuestionCustom = $state(
    isCustomTime(app.settings.perQuestionSeconds, perQuestionOptions)
  );
  let totalCustom = $state(isCustomTime(app.settings.totalSeconds, totalTimeOptions));

  function setPerQuestion(seconds: number, custom: boolean): void {
    perQuestionCustom = custom;
    app.updateSettings({ perQuestionSeconds: seconds });
  }

  function setTotal(seconds: number, custom: boolean): void {
    totalCustom = custom;
    app.updateSettings({ totalSeconds: seconds });
  }
</script>

<Card title={t("setup.run.title")} description={t("setup.run.description")}>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("setup.sets.title")}
      </span>
      {#each shownSets as group (group)}
        <Switch
          label={t(`common.group.${group}`)}
          hint={t(`setup.sets.${group}`)}
          checked={app.settings[groupFlag(group)] === true}
          onchange={(value) => app.setGroup(group, value)}
        />
      {/each}
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("setup.questions.title")}
      </span>
      <QuestionCountPicker />
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("setup.difficulty.title")}
      </span>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {#each difficulties as level (level)}
          <OptionCard
            label={difficultyLabel(level)}
            hint={t(`setup.difficulty.${level}`)}
            active={app.settings.difficulty === level}
            onclick={() => app.updateSettings({ difficulty: level })}
          />
        {/each}
      </div>
      {#if !enoughToSort}
        <p class="text-xs leading-snug text-muted-foreground">
          {t("setup.difficulty.tooFew", { min: difficultyMinPool })}
        </p>
      {:else if app.settings.answerStyle === "typing"}
        <p class="text-xs leading-snug text-muted-foreground">
          {t("setup.difficulty.choiceOnly")}
        </p>
      {/if}
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("setup.time.perQuestion")}
      </span>
      <div class="flex flex-wrap gap-2">
        {#each perQuestionOptions as seconds (seconds)}
          <Chip
            size="sm"
            active={!perQuestionCustom && app.settings.perQuestionSeconds === seconds}
            onclick={() => setPerQuestion(seconds, false)}
          >
            {timeLabel(seconds)}
          </Chip>
        {/each}
        <CustomNumberChip
          value={app.settings.perQuestionSeconds}
          min={1}
          max={customPerQuestionMax}
          unit="s"
          title={t("setup.time.seconds")}
          active={perQuestionCustom}
          onpick={(seconds) => setPerQuestion(seconds, true)}
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("setup.time.wholeRun")}
      </span>
      <div class="flex flex-wrap gap-2">
        {#each totalTimeOptions as seconds (seconds)}
          <Chip
            size="sm"
            active={!totalCustom && app.settings.totalSeconds === seconds}
            onclick={() => setTotal(seconds, false)}
          >
            {timeLabel(seconds)}
          </Chip>
        {/each}
        <CustomNumberChip
          value={Math.round(app.settings.totalSeconds / 60)}
          min={1}
          max={customTotalMinutesMax}
          unit="m"
          title={t("setup.time.minutes")}
          active={totalCustom}
          onpick={(minutes) => setTotal(minutes * 60, true)}
        />
      </div>
    </div>
  </div>
</Card>
