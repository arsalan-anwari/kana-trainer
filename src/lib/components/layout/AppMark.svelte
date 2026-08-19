<script lang="ts">
  /** The あ seal used as the app mark, matching the installed icon. */
  let { class: className = "size-10" }: { class?: string } = $props();
</script>

<span
  class="kana inline-flex items-center justify-center rounded-lg bg-foreground font-medium text-background {className}"
>
  あ
</span>
