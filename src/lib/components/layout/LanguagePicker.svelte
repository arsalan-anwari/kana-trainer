<script lang="ts">
  import { i18n, locales, t } from "../../i18n.svelte";
  import { app } from "../../state.svelte";
  import { Select } from "kaizen-ui";

  let { full = false }: { full?: boolean } = $props();

  const options = locales.map((locale) => ({ value: locale.tag, label: locale.name }));
</script>

<Select
  value={app.prefs.lang === "auto" ? i18n.locale : app.prefs.lang}
  {options}
  label={t("prefs.language")}
  closeLabel={t("common.close")}
  size={full ? "md" : "sm"}
  {full}
  onchange={(next) => app.setPref("lang", next)}
/>
