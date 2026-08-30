<script lang="ts">
  import { groupLabel } from "../../core/kana";
  import { missesByGroup } from "../../core/report";
  import type { Answer } from "../../core/quiz";
  import Badge from "../../ui/Badge.svelte";
  import Card from "../../ui/Card.svelte";

  // The missed characters, listed by group and row per alphabet.

  let { answers }: { answers: Answer[] } = $props();

  const boxes = $derived(missesByGroup(answers));
  const total = $derived(boxes.reduce((sum, box) => sum + box.misses, 0));
</script>

{#if total > 0}
  <Card
    title="Mistakes by group"
    description="Every character you missed, filed by set, row and alphabet."
  >
    <div class="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
      {#each boxes as box (box.group)}
        <div class="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold">{groupLabel(box.group)}</span>
            <Badge tone={box.misses === 0 ? "outline" : "danger"}>
              {box.misses}
              {box.misses === 1 ? "miss" : "misses"}
            </Badge>
          </div>

          {#if box.rows.length === 0}
            <p class="py-2 text-xs text-muted-foreground">Nothing missed here.</p>
          {:else}
            <div class="flex flex-col gap-2">
              {#each box.rows as entry (entry.row.id)}
                <div class="flex items-start gap-2">
                  <span
                    class="w-14 shrink-0 whitespace-nowrap pt-1 text-[0.625rem] font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    {entry.row.label}
                  </span>
                  <div class="flex flex-wrap gap-1.5">
                    {#each entry.misses as miss (miss.key)}
                      <span
                        class="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-1"
                        title="{miss.romaji}, missed {miss.misses} of {miss.total}"
                      >
                        <span class="kana text-base leading-none">{miss.glyph}</span>
                        <span class="text-[0.625rem] leading-none text-muted-foreground">
                          {miss.romaji}
                        </span>
                        <span class="text-[0.625rem] font-bold leading-none text-danger tabular-nums">
                          {miss.misses}
                        </span>
                      </span>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </Card>
{/if}
