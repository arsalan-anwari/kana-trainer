<script lang="ts">
  import Chip from "./Chip.svelte";
  import NumberRoller from "./NumberRoller.svelte";
  import { t } from "../i18n.svelte";

  // A "Custom" chip that turns into the number once it is picked: a typed field
  // on a desktop pointer, the scroll wheel on a touch one. Whether it counts as
  // picked is the caller's to hold, a custom value can land on a preset.

  let {
    value,
    min,
    max,
    unit = "",
    title,
    active = false,
    onpick
  }: {
    value: number;
    min: number;
    max: number;
    unit?: string;
    title: string;
    active?: boolean;
    onpick: (value: number) => void;
  } = $props();

  const values = $derived(Array.from({ length: max - min + 1 }, (_, index) => min + index));

  let rolling = $state(false);

  const touch = $derived(
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );

  function clamp(raw: number): number {
    if (!Number.isFinite(raw)) return min;
    return Math.min(max, Math.max(min, Math.round(raw)));
  }

  const start = $derived(clamp(value > 0 ? value : min));

  function open(): void {
    if (touch) {
      rolling = true;
      return;
    }
    onpick(start);
  }

  function commit(event: Event & { currentTarget: HTMLInputElement }): void {
    const next = clamp(Number(event.currentTarget.value));
    // the field keeps whatever was typed whenever the clamp lands back on the
    // value already held, so write the accepted number in by hand
    event.currentTarget.value = String(next);
    onpick(next);
  }

  function picked(next: number): void {
    rolling = false;
    onpick(next);
  }
</script>

{#if active && !touch}
  <label
    class="flex h-9 items-center gap-1 rounded-md border-2 border-selected bg-selected-soft px-2 text-xs font-semibold"
  >
    <span class="sr-only">{title}</span>
    <input
      type="number"
      inputmode="numeric"
      {min}
      {max}
      {value}
      onchange={commit}
      onblur={commit}
      class="w-10 min-w-0 bg-transparent text-center tabular-nums outline-none"
    />
    <span aria-hidden="true">{unit}</span>
  </label>
{:else}
  <Chip size="sm" {active} {title} onclick={open}>
    {active ? `${value}${unit}` : t("common.custom")}
  </Chip>
{/if}

{#if rolling}
  <NumberRoller
    {values}
    value={start}
    {title}
    onpick={picked}
    onclose={() => (rolling = false)}
  />
{/if}
