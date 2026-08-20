<script lang="ts">
  import { untrack } from "svelte";
  import { sfx } from "../audio";
  import Button from "./Button.svelte";

  /**
   * The phone side of a numeric choice: a wheel of values that snaps to the one
   * under the centre band, the way a native picker reads.
   */

  let {
    values,
    value,
    title = "Pick a value",
    onpick,
    onclose
  }: {
    values: number[];
    value: number;
    title?: string;
    onpick: (value: number) => void;
    onclose: () => void;
  } = $props();

  /** Must match the h-11 on each row below. */
  const ITEM = 44;

  let wheel = $state<HTMLDivElement | null>(null);
  let current = $state(0);

  // one shot: park the wheel on the value it opened with. Untracked, so the
  // scroll it causes does not feed back in and fight the finger on the wheel.
  $effect(() => {
    const element = wheel;
    if (element === null) return;
    untrack(() => {
      const index = Math.max(0, values.indexOf(value));
      current = values[index];
      element.scrollTop = index * ITEM;
    });
  });

  function scrolled(): void {
    if (wheel === null) return;
    const index = Math.round(wheel.scrollTop / ITEM);
    const next = values[Math.min(values.length - 1, Math.max(0, index))];
    if (next === current) return;
    current = next;
    sfx.tick();
  }

  function keydown(event: KeyboardEvent): void {
    if (event.key === "Escape") onclose();
  }
</script>

<svelte:window onkeydown={keydown} />

<div class="fixed inset-0 z-50 flex items-end justify-center">
  <button
    type="button"
    class="absolute inset-0 cursor-default bg-foreground/40"
    aria-label="Close"
    onclick={onclose}
  ></button>

  <div
    class="anim-sheet relative flex w-full max-w-md flex-col gap-3 rounded-t-2xl border border-border bg-surface p-4 pb-6"
    role="dialog"
    aria-modal="true"
    aria-label={title}
  >
    <span class="text-center text-sm font-semibold">{title}</span>

    <div class="relative h-[220px] overflow-hidden">
      <!-- the band the picked value sits in -->
      <div
        class="pointer-events-none absolute inset-x-2 top-1/2 h-11 -translate-y-1/2 rounded-lg border-2 border-foreground/25 bg-foreground/5"
        aria-hidden="true"
      ></div>

      <div
        bind:this={wheel}
        onscroll={scrolled}
        class="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain py-[88px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label={title}
        tabindex="-1"
      >
        {#each values as option (option)}
          <div
            role="option"
            aria-selected={option === current}
            class="flex h-11 snap-center items-center justify-center text-h3 font-bold tabular-nums transition-opacity {option ===
            current
              ? 'opacity-100'
              : 'opacity-35'}"
          >
            {option}
          </div>
        {/each}
      </div>
    </div>

    <div class="flex gap-2">
      <Button variant="outline" full onclick={onclose}>Cancel</Button>
      <Button variant="brand" full onclick={() => onpick(current)}>Done</Button>
    </div>
  </div>
</div>
