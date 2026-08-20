<script lang="ts">
  import {
    clampCustomCount,
    customCountMax,
    customCountMin,
    customCountStep,
    customCountValues,
    isCustomCount,
    questionCountRows
  } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Chip from "../../ui/Chip.svelte";
  import NumberRoller from "../../ui/NumberRoller.svelte";

  /**
   * Ten preset lengths over two rows, then a free choice and a single pass.
   * The free choice is an input where there is a keyboard and a wheel where
   * there is a thumb.
   */

  let custom = $state(isCustomCount(app.settings.questionCount));
  let rolling = $state(false);
  let field = $state<HTMLInputElement | null>(null);
  let draft = $state(String(app.settings.questionCount || customCountMin));

  const touch = $derived(
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );

  function choose(count: number): void {
    custom = false;
    app.updateSettings({ questionCount: count });
  }

  function openCustom(): void {
    custom = true;
    const start = clampCustomCount(app.settings.questionCount || customCountMin);
    draft = String(start);
    if (touch) {
      rolling = true;
      return;
    }
    app.updateSettings({ questionCount: start });
    queueMicrotask(() => field?.select());
  }

  function commit(): void {
    const next = clampCustomCount(Number(draft));
    draft = String(next);
    app.updateSettings({ questionCount: next });
  }

  function picked(value: number): void {
    rolling = false;
    draft = String(value);
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
    {#if custom && !touch}
      <label
        class="flex h-9 items-center gap-2 rounded-md border-2 border-foreground bg-foreground/10 px-2 text-xs font-semibold"
      >
        <span class="sr-only">Number of questions</span>
        <input
          bind:this={field}
          bind:value={draft}
          type="number"
          inputmode="numeric"
          min={customCountMin}
          max={customCountMax}
          step={customCountStep}
          onblur={commit}
          onchange={commit}
          class="w-full min-w-0 bg-transparent text-center tabular-nums outline-none"
        />
      </label>
    {:else}
      <Chip size="sm" class="w-full" active={custom} onclick={openCustom}>
        {custom ? app.settings.questionCount : "Custom"}
      </Chip>
    {/if}

    <Chip
      size="sm"
      class="w-full"
      active={app.settings.questionCount === 0}
      onclick={() => choose(0)}
    >
      One pass
    </Chip>
  </div>
</div>

{#if rolling}
  <NumberRoller
    values={customCountValues}
    value={clampCustomCount(app.settings.questionCount || customCountMin)}
    title="Number of questions"
    onpick={picked}
    onclose={() => (rolling = false)}
  />
{/if}
