<script lang="ts">
  // Line icons, drawn on one 24 unit grid.

  import type { IconName } from "./icons";

  let {
    name,
    class: className = "size-4"
  }: { name: IconName; class?: string } = $props();
</script>

<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  aria-hidden="true"
>
  {#if name === "sun"}
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  {:else if name === "moon"}
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
  {:else if name === "monitor"}
    <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
    <path d="M8.5 20.5h7M12 16.5v4" />
  {:else if name === "select-all"}
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 12.2l2.7 2.8L16 9.5" />
  {:else if name === "select-none"}
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
  {:else if name === "folder-open"}
    <path d="M3 8.5V6a2 2 0 0 1 2-2h3.6a2 2 0 0 1 1.4.6L11.5 6H19a2 2 0 0 1 2 2v1" />
    <path d="M3.3 10.5h18.1l-2 8.2a2 2 0 0 1-1.9 1.5H5.2a2 2 0 0 1-2-1.7z" />
  {:else if name === "download"}
    <path d="M12 3.5v11" />
    <path d="M7.5 10.5l4.5 4.5 4.5-4.5" />
    <path d="M4 16.5v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  {:else if name === "trash"}
    <path d="M4 6.5h16" />
    <path d="M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
    <path d="M6.3 6.5l.9 12.2a2 2 0 0 0 2 1.8h5.6a2 2 0 0 0 2-1.8l.9-12.2" />
    <path d="M10.3 10.5v6M13.7 10.5v6" />
  {:else if name === "filter"}
    <path d="M3.5 5.5h17l-6.5 7.6v5.6l-4 2.3v-7.9z" />
  {:else if name === "calendar"}
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  {:else if name === "chevron-down"}
    <path d="M6 9.5l6 6 6-6" />
  {:else if name === "sliders"}
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2.2" />
    <circle cx="10" cy="17" r="2.2" />
  {:else if name === "contrast"}
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none" />
  {:else if name === "volume-on"}
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
    <path d="M16 9a4.5 4.5 0 0 1 0 6M18.7 6.5a8 8 0 0 1 0 11" />
  {:else if name === "volume-off"}
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
    <path d="M16.5 9.8l4.5 4.4M21 9.8l-4.5 4.4" />
  {:else if name === "zoom-in"}
    <circle cx="11" cy="11" r="6.5" />
    <path d="M8.5 11h5M11 8.5v5M15.8 15.8L20.5 20.5" />
  {:else if name === "zoom-out"}
    <circle cx="11" cy="11" r="6.5" />
    <path d="M8.5 11h5M15.8 15.8L20.5 20.5" />
  {:else if name === "close"}
    <path d="M6 6l12 12M18 6L6 18" />
  {/if}
</svg>
