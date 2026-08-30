<script lang="ts">
  // Answer states are marked on the field itself, the same way choice tiles are.
  type Tone = "idle" | "correct" | "wrong";

  let {
    value = $bindable(""),
    placeholder = "",
    disabled = false,
    big = false,
    focusOnMount = false,
    tone = "idle",
    onenter
  }: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    big?: boolean;
    focusOnMount?: boolean;
    tone?: Tone;
    onenter?: () => void;
  } = $props();

  let element = $state<HTMLInputElement | null>(null);

  $effect(() => {
    if (focusOnMount && element !== null && !disabled) element.focus();
  });

  // the field is sized by padding, never by a fixed height: a fixed height leaves
  // each engine to place the shorter line box wherever it likes, which drops the
  // text off centre on WebKit and Firefox
  const tones: Record<Tone, string> = {
    idle: "border-input bg-surface focus-visible:border-foreground disabled:opacity-50",
    correct: "border-success bg-success-soft text-success",
    wrong: "border-danger bg-danger-soft text-danger anim-shake"
  };

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
  class="w-full rounded-xl border-2 text-center font-semibold transition-colors placeholder:font-normal placeholder:text-muted-foreground focus-visible:outline-none {tones[
    tone
  ]} {big ? 'py-2.5 text-h2 sm:py-4.5' : 'px-4 py-2.5 text-sm'}"
/>
