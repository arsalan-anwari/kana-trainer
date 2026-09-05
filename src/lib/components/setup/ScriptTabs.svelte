<script lang="ts">
  import type { Script } from "../../core/kana";
  import { selectionFor } from "../../core/settings";
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";

  // Picks which alphabet the character picker below is editing.

  const tabs: Script[] = ["hiragana", "katakana"];

  const shown = $derived(tabs.filter((tab) => app.settings.scripts.includes(tab)));
</script>

{#if shown.length > 1}
  <div
    class="flex items-center gap-1 rounded-lg border border-border bg-secondary p-1"
    role="tablist"
    aria-label={t("setup.characters.editAlphabet")}
  >
    {#each shown as tab (tab)}
      {@const count = selectionFor(app.settings, tab).length}
      <button
        type="button"
        role="tab"
        aria-selected={app.pickerScript === tab}
        class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors {app.pickerScript ===
        tab
          ? 'bg-surface text-foreground ring-2 ring-selected ring-inset shadow-[0_1px_0_var(--color-border)]'
          : 'text-muted-foreground hover:text-foreground'}"
        onclick={() => app.usePicker(tab)}
      >
        {t(`common.${tab}`)}
        <span class="rounded px-1.5 py-0.5 text-[0.625rem] tabular-nums {app.pickerScript === tab
          ? 'bg-selected text-background'
          : 'bg-secondary text-muted-foreground'}">
          {count}
        </span>
      </button>
    {/each}
  </div>
{/if}
