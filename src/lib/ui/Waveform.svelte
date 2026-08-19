<script lang="ts">
  /** Bar histogram of a sound, filled up to the current playback position. */

  let {
    peaks,
    progress = 0,
    tone = "muted",
    class: className = ""
  }: {
    peaks: number[];
    progress?: number;
    tone?: "muted" | "strong" | "success" | "danger";
    class?: string;
  } = $props();

  const played: Record<string, string> = {
    muted: "bg-foreground",
    strong: "bg-background",
    success: "bg-success",
    danger: "bg-danger"
  };

  const rest: Record<string, string> = {
    muted: "bg-wire",
    strong: "bg-background/40",
    success: "bg-success/30",
    danger: "bg-danger/30"
  };
</script>

<div class="flex h-full w-full items-center gap-[2px] {className}" aria-hidden="true">
  {#each peaks as peak, index (index)}
    <span
      class="min-h-[2px] flex-1 rounded-full transition-colors duration-75 {index / peaks.length <
      progress
        ? played[tone]
        : rest[tone]}"
      style="height: {Math.round(peak * 100)}%"
    ></span>
  {/each}
</div>
