<script lang="ts">
  import {
    perQuestionOptions,
    questionCountOptions,
    totalTimeOptions
  } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import Chip from "../../ui/Chip.svelte";

  function timeLabel(seconds: number): string {
    if (seconds === 0) return "Off";
    if (seconds < 60) return `${seconds}s`;
    return `${seconds / 60}m`;
  }
</script>

<Card title="Time trial" description="Leave both off for a relaxed run.">
  <div class="flex flex-col gap-4">
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
    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Questions
      </span>
      <div class="flex flex-wrap gap-2">
        {#each questionCountOptions as count (count)}
          <Chip
            size="sm"
            active={app.settings.questionCount === count}
            onclick={() => app.updateSettings({ questionCount: count })}
          >
            {count}
          </Chip>
        {/each}
        <Chip
          size="sm"
          active={app.settings.questionCount === 0}
          onclick={() => app.updateSettings({ questionCount: 0 })}
        >
          One pass
        </Chip>
      </div>
    </div>
  </div>
</Card>
