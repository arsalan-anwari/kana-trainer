<script lang="ts">
  import { i18n, locales, t } from "../../i18n.svelte";
  import { app } from "../../state.svelte";

  // A plain select: twelve languages is too many to cycle through a button, and
  // the names stay in their own language so the entry you want reads the same
  // whatever the app is set to right now.

  let { full = false }: { full?: boolean } = $props();
</script>

<select
  value={app.prefs.lang === "auto" ? i18n.locale : app.prefs.lang}
  onchange={(event) => app.setPref("lang", event.currentTarget.value)}
  aria-label={t("prefs.language")}
  class="h-8 cursor-pointer rounded-md border border-border bg-surface pl-1.5 pr-2.5 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {full
    ? 'h-9 w-full pl-2 pr-3 text-sm'
    : ''}"
>
  {#each locales as locale (locale.tag)}
    <option value={locale.tag}>{locale.name}</option>
  {/each}
</select>
