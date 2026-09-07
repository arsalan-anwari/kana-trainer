<script lang="ts">
  import { heatColor, Meter } from "kaizen-ui";
  import type { Script } from "../../core/kana";
  import type { Answer } from "../../core/quiz";
  import { masteryLabel, masteryOf, strength, summarize } from "../../core/report";
  import { t } from "../../i18n.svelte";

  // One dial per alphabet that actually turns up in the shown runs, so a view
  // narrowed to hiragana draws a single dial rather than half an empty
  // comparison. The dial is strength; the bar under it is share of the work,
  // and carries its own number so the two are never read as the same thing.

  let { answers, scripts }: { answers: Answer[]; scripts: Script[] } = $props();

  const parts = $derived(
    scripts.map((script) => {
      const stats = summarize(answers.filter((answer) => answer.script === script));
      return {
        script,
        label: t(`common.${script}`),
        stats,
        strength: strength(stats.correct, stats.total),
        mastery: masteryOf(stats.correct, stats.total),
        share: answers.length === 0 ? 0 : stats.total / answers.length
      };
    })
  );
</script>

{#if parts.length === 0}
  <p class="py-6 text-center text-sm text-muted-foreground">{t("reports.noData")}</p>
{:else}
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {#each parts as part (part.script)}
      <div class="flex items-center gap-3 rounded-xl border-2 border-border bg-background p-3">
        <div
          class="grid size-16 shrink-0 place-items-center rounded-full"
          style="background: conic-gradient({heatColor(part.strength)} {part.strength *
            100}%, var(--color-secondary) 0)"
          aria-hidden="true"
        >
          <div
            class="grid size-11 place-items-center rounded-full bg-background text-xs font-bold tabular-nums"
          >
            {Math.round(part.strength * 100)}%
          </div>
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <span class="flex items-baseline gap-2">
            <span class="text-sm font-bold">{part.label}</span>
            <span class="text-[0.625rem] font-bold" style="color: {heatColor(part.strength)}">
              {masteryLabel(part.mastery)}
            </span>
          </span>
          <span class="text-xs tabular-nums text-muted-foreground">
            {t("reports.tip.rowRight", { correct: part.stats.correct, total: part.stats.total })}
          </span>
          <Meter
            value={part.share}
            tone="brand"
            size="sm"
            label={t("reports.alphabets.shareLabel")}
          />
        </div>
      </div>
    {/each}
  </div>
{/if}
