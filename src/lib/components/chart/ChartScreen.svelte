<script lang="ts">
  import { rowsInGroup, type Group } from "../../core/kana";
  import { groupLabel } from "../../labels";
  import ChartRow from "./ChartRow.svelte";
  import { t } from "../../i18n.svelte";
  import { Card, Icon } from "kaizen-ui";

  const sections: { group: Group; japanese: string }[] = [
    { group: "seion", japanese: "清音" },
    { group: "dakuon", japanese: "濁音" },
    { group: "handakuon", japanese: "半濁音" },
    { group: "yoon", japanese: "拗音" },
    { group: "tokushon", japanese: "特殊音" }
  ];
</script>

<div class="flex flex-col gap-5">
  <div class="sheet ruled flex items-center gap-4 rounded-2xl border-2 border-border bg-sidebar p-4 sm:p-5">
    <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
      <Icon name="target" class="size-6" />
    </span>
    <span class="flex min-w-0 flex-col gap-0.5">
      <span class="text-h2 font-bold leading-tight">{t("chart.title")}</span>
      <span class="text-sm text-muted-foreground">{t("chart.description")}</span>
    </span>
  </div>

  {#each sections as section (section.group)}
    <Card
      title="{groupLabel(section.group)} {section.japanese}"
      description={t(`chart.${section.group}`)}
    >
      <div class="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-x-8">
        {#each rowsInGroup(section.group) as row (row.id)}
          <ChartRow {row} />
        {/each}
      </div>
    </Card>
  {/each}
</div>
