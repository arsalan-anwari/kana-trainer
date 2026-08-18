<script lang="ts">
  let {
    value = $bindable(""),
    placeholder = "",
    disabled = false,
    big = false,
    focusOnMount = false,
    onenter
  }: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    big?: boolean;
    focusOnMount?: boolean;
    onenter?: () => void;
  } = $props();

  let element = $state<HTMLInputElement | null>(null);

  $effect(() => {
    if (focusOnMount && element !== null && !disabled) element.focus();
  });

  function keydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      onenter?.();
    }
  }
</script>

<input
  type="text"
  bind:this={element}
  bind:value
  {placeholder}
  {disabled}
  autocomplete="off"
  autocapitalize="off"
  autocorrect="off"
  spellcheck="false"
  onkeydown={keydown}
  class="w-full rounded-xl border-2 border-input bg-background text-center font-semibold transition-colors placeholder:font-normal placeholder:text-muted-foreground focus-visible:border-brand focus-visible:outline-none disabled:opacity-50 {big
    ? 'h-16 text-h2'
    : 'h-11 px-4 text-sm'}"
/>
