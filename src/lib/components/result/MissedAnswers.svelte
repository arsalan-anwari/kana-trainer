<script lang="ts">
  import { glyph, kanaById } from "../../core/kana";
  import type { Answer } from "../../core/quiz";
  import Badge from "../../ui/Badge.svelte";
  import Card from "../../ui/Card.svelte";
  import { t } from "../../i18n.svelte";

  let { misses }: { misses: Answer[] } = $props();
</script>

<Card title={t("result.missed.title")} description={t("result.missed.description")}>
  {#if misses.length === 0}
    <p class="py-4 text-center text-sm text-muted-foreground">{t("result.missed.none")}</p>
  {:else}
    <div class="flex flex-wrap gap-3">
      {#each misses as miss, index (index)}
        {@const kana = kanaById(miss.kanaId)}
        {#if kana}
          <div class="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
            <span class="kana text-h2">{glyph(kana, miss.script)}</span>
            <div class="flex flex-col">
              <span class="text-sm font-semibold">{kana.romaji}</span>
              <span class="text-xs text-muted-foreground">
                {miss.timedOut
                  ? t("result.missed.timedOut")
                  : t("result.missed.said", {
                      given: miss.given === "" ? t("result.missed.nothing") : miss.given
                    })}
              </span>
            </div>
            <Badge tone="danger">{t(`result.missed.${miss.script}`)}</Badge>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</Card>
