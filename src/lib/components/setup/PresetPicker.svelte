<script lang="ts">
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import ConfirmDialog from "../../ui/ConfirmDialog.svelte";
  import IconButton from "../../ui/IconButton.svelte";
  import TextField from "../../ui/TextField.svelte";

  // Named character selections. A preset holds the characters picked in both
  // alphabets and nothing else, so loading one leaves every other setting alone.

  let chosen = $state("");
  let naming = $state(false);
  let name = $state("");
  let confirming = $state(false);

  // a preset removed elsewhere must not stay selected
  $effect(() => {
    if (chosen !== "" && !app.presets.some((preset) => preset.name === chosen)) chosen = "";
  });

  function pick(event: Event): void {
    chosen = (event.currentTarget as HTMLSelectElement).value;
    if (chosen !== "") app.applyPreset(chosen);
  }

  function startNaming(): void {
    name = "";
    naming = true;
  }

  function add(): void {
    const trimmed = name.trim();
    if (trimmed === "") return;
    app.savePreset(trimmed);
    chosen = trimmed;
    naming = false;
  }

  function remove(): void {
    app.deletePreset(chosen);
    chosen = "";
    confirming = false;
  }
</script>

<select
  value={chosen}
  onchange={pick}
  aria-label="Preset"
  disabled={app.presets.length === 0}
  class="h-9 min-w-32 cursor-pointer rounded-md border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
>
  <option value="">{app.presets.length === 0 ? "No presets" : "Presets"}</option>
  {#each app.presets as preset (preset.name)}
    <option value={preset.name}>{preset.name}</option>
  {/each}
</select>

<IconButton
  icon="save"
  size="sm"
  label="Update preset"
  disabled={chosen === ""}
  onclick={() => app.savePreset(chosen)}
/>
<IconButton icon="plus" size="sm" label="New preset" onclick={startNaming} />
<IconButton
  icon="restore"
  size="sm"
  label="Restore preset"
  disabled={chosen === ""}
  onclick={() => app.applyPreset(chosen)}
/>
<IconButton
  icon="trash"
  size="sm"
  label="Delete preset"
  disabled={chosen === ""}
  onclick={() => (confirming = true)}
/>

{#if naming}
  <div class="flex w-full items-center gap-2">
    <div class="min-w-0 flex-1">
      <TextField bind:value={name} placeholder="Preset name" focusOnMount onenter={add} />
    </div>
    <Button size="sm" variant="brand" onclick={add}>Save</Button>
    <Button size="sm" variant="outline" onclick={() => (naming = false)}>Cancel</Button>
  </div>
{/if}

{#if confirming}
  <ConfirmDialog
    title="Remove this preset?"
    confirmLabel="Remove it"
    cancelLabel="Keep it"
    onconfirm={remove}
    oncancel={() => (confirming = false)}
  >
    This throws away the "{chosen}" preset. The characters picked right now stay as they
    are.
  </ConfirmDialog>
{/if}
