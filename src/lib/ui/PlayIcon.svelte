<script lang="ts">
  let { playing = false, class: className = "size-5" }: { playing?: boolean; class?: string } =
    $props();
</script>

<svg viewBox="0 0 24 24" fill="currentColor" class={className} aria-hidden="true">
  {#if playing}
    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
  {:else}
    <path d="M8 5.5v13l11-6.5z" />
  {/if}
</svg>
