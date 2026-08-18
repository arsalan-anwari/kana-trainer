<script lang="ts">
  let {
    value = 0,
    tone = "brand",
    class: className = ""
  }: { value?: number; tone?: "brand" | "primary" | "danger"; class?: string } = $props();

  const tones = {
    brand: "bg-brand",
    primary: "bg-primary",
    danger: "bg-danger"
  };
</script>

<div
  class="h-3 w-full overflow-hidden rounded-full bg-secondary {className}"
  role="progressbar"
  aria-valuenow={Math.round(value)}
  aria-valuemin={0}
  aria-valuemax={100}
>
  <div
    class="h-full rounded-full transition-[width] duration-300 ease-out {tones[tone]}"
    style="width: {Math.max(0, Math.min(100, value))}%"
  ></div>
</div>
