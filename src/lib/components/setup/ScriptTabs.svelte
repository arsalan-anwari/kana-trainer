<script lang="ts">
  import type { Script } from "../../core/kana";
  import { selectionFor } from "../../core/settings";
  import { app } from "../../state.svelte";

  // Picks which alphabet the character picker below is editing.

  const tabs: { value: Script; label: string }[] = [
    { value: "hiragana", label: "Hiragana" },
    { value: "katakana", label: "Katakana" }
  ];

  const shown = $derived(tabs.filter((tab) => app.settings.scripts.includes(tab.value)));
</script>

{#if shown.length > 1}
  <div
    class="flex items-center gap-1 rounded-lg border border-border bg-secondary p-1"
    role="tablist"
    aria-label="Alphabet to edit"
  >
    {#each shown as tab (tab.value)}
      {@const count = selectionFor(app.settings, tab.value).length}
      <button
        type="button"
        role="tab"
        aria-selected={app.pickerScript === tab.value}
        class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors {app.pickerScript ===
        tab.value
          ? 'bg-surface text-foreground ring-2 ring-selected ring-inset shadow-[0_1px_0_var(--color-border)]'
          : 'text-muted-foreground hover:text-foreground'}"
        onclick={() => app.usePicker(tab.value)}
      >
        {tab.label}
        <span class="rounded px-1.5 py-0.5 text-[0.625rem] tabular-nums {app.pickerScript === tab.value
          ? 'bg-selected text-background'
          : 'bg-secondary text-muted-foreground'}">
          {count}
        </span>
      </button>
    {/each}
  </div>
{/if}
