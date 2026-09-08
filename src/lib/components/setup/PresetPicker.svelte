<script lang="ts">
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { ActionSelect, Button, ConfirmDialog, TextField } from "kaizen-ui";

  let chosen = $state("");
  let naming = $state(false);
  let name = $state("");
  let confirming = $state(false);

  $effect(() => {
    if (chosen !== "" && !app.presets.some((preset) => preset.name === chosen)) chosen = "";
  });

  const names = $derived(app.presets.map((preset) => preset.name));

  const actions = $derived([
    {
      icon: "save" as const,
      label: t("setup.presets.update"),
      disabled: chosen === "",
      onclick: (): void => app.savePreset(chosen)
    },
    { icon: "plus" as const, label: t("setup.presets.create"), onclick: startNaming },
    {
      icon: "restore" as const,
      label: t("setup.presets.restore"),
      disabled: chosen === "",
      onclick: (): void => app.applyPreset(chosen)
    },
    {
      icon: "trash" as const,
      label: t("setup.presets.delete"),
      disabled: chosen === "",
      onclick: (): void => {
        confirming = true;
      }
    }
  ]);

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

<ActionSelect
  bind:value={chosen}
  options={names}
  label={t("setup.presets.label")}
  empty={t(app.presets.length === 0 ? "setup.presets.none" : "setup.presets.some")}
  closeLabel={t("common.close")}
  {actions}
  onchange={(next) => {
    if (next !== "") app.applyPreset(next);
  }}
/>

{#if naming}
  <div class="flex w-full items-center gap-2">
    <div class="min-w-0 flex-1">
      <TextField bind:value={name} placeholder={t("setup.presets.name")} focusOnMount onenter={add} />
    </div>
    <Button size="sm" variant="brand" onclick={add}>{t("common.save")}</Button>
    <Button size="sm" variant="outline" onclick={() => (naming = false)}>{t("common.cancel")}</Button>
  </div>
{/if}

{#if confirming}
  <ConfirmDialog
    title={t("setup.presets.confirmTitle")}
    confirmLabel={t("common.delete")}
    cancelLabel={t("common.keep")}
    closeLabel={t("common.close")}
    onconfirm={remove}
    oncancel={() => (confirming = false)}
  >
    {t("setup.presets.confirmBody", { name: chosen })}
  </ConfirmDialog>
{/if}
