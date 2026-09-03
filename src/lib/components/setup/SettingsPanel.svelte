<script lang="ts">
  import {
    difficulties,
    difficultyLabel,
    difficultyMinPool,
    groupFlag,
    optionalGroups,
    perQuestionOptions,
    totalTimeOptions,
    type Difficulty
  } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import Chip from "../../ui/Chip.svelte";
  import OptionCard from "../../ui/OptionCard.svelte";
  import Switch from "../../ui/Switch.svelte";
  import QuestionCountPicker from "./QuestionCountPicker.svelte";

  const sets = [
    { group: optionalGroups[0], label: "Dakuon", hint: "が ざ だ ば rows" },
    { group: optionalGroups[1], label: "Handakuon", hint: "ぱ row" },
    { group: optionalGroups[2], label: "Yoon", hint: "きゃ しゃ ちゃ and the rest" },
    { group: optionalGroups[3], label: "Tokushon", hint: "ファ ティ ヴァ, katakana only" }
  ];

  // tokushon has no hiragana form, so it is offered only once katakana is in the run
  const shownSets = $derived(
    sets.filter(
      (set) => set.group !== "tokushon" || app.settings.scripts.includes("katakana")
    )
  );

  const hints: Record<Difficulty, string> = {
    beginner: "Wrong answers are picked at random",
    advanced: "One wrong answer is a look alike",
    expert: "Every wrong answer is a look alike"
  };

  // whether the pool is large enough for the difficulty to matter
  const enoughToSort = $derived(app.eligibleCount >= difficultyMinPool);

  function timeLabel(seconds: number): string {
    if (seconds === 0) return "Off";
    if (seconds < 60) return `${seconds}s`;
    return `${seconds / 60}m`;
  }
</script>

<Card title="Run options" description="What is in the run, how long it is and how hard it pushes.">
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Extra character sets
      </span>
      {#each shownSets as set (set.group)}
        <Switch
          label={set.label}
          hint={set.hint}
          checked={app.settings[groupFlag(set.group)] === true}
          onchange={(value) => app.setGroup(set.group, value)}
        />
      {/each}
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Questions
      </span>
      <QuestionCountPicker />
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Difficulty
      </span>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {#each difficulties as level (level)}
          <OptionCard
            label={difficultyLabel(level)}
            hint={hints[level]}
            active={app.settings.difficulty === level}
            onclick={() => app.updateSettings({ difficulty: level })}
          />
        {/each}
      </div>
      {#if !enoughToSort}
        <p class="text-xs leading-snug text-muted-foreground">
          Ignored below {difficultyMinPool} characters in play, there are not enough look alikes
          to choose from.
        </p>
      {:else if app.settings.answerStyle === "typing"}
        <p class="text-xs leading-snug text-muted-foreground">
          Only applies to multiple choice runs.
        </p>
      {/if}
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Per question
      </span>
      <div class="flex flex-wrap gap-2">
        {#each perQuestionOptions as seconds (seconds)}
          <Chip
            size="sm"
            active={app.settings.perQuestionSeconds === seconds}
            onclick={() => app.updateSettings({ perQuestionSeconds: seconds })}
          >
            {timeLabel(seconds)}
          </Chip>
        {/each}
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Whole run
      </span>
      <div class="flex flex-wrap gap-2">
        {#each totalTimeOptions as seconds (seconds)}
          <Chip
            size="sm"
            active={app.settings.totalSeconds === seconds}
            onclick={() => app.updateSettings({ totalSeconds: seconds })}
          >
            {timeLabel(seconds)}
          </Chip>
        {/each}
      </div>
    </div>
  </div>
</Card>
