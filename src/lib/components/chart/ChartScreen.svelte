<script lang="ts">
  import { groupLabel, rowsInGroup, type Group } from "../../core/kana";
  import Card from "../../ui/Card.svelte";
  import ChartRow from "./ChartRow.svelte";

  const sections: { group: Group; japanese: string; description: string }[] = [
    { group: "seion", japanese: "清音", description: "The 46 basic characters." },
    { group: "dakuon", japanese: "濁音", description: "Voiced か さ た は rows." },
    { group: "handakuon", japanese: "半濁音", description: "Half voiced は row." },
    { group: "yoon", japanese: "拗音", description: "Contracted with a small ゃ ゅ ょ." }
  ];

  function widest(group: Group): number {
    return Math.max(...rowsInGroup(group).map((row) => row.kana.length));
  }
</script>

<div class="flex flex-col gap-5">
  <div class="flex flex-col gap-1 rounded-xl border border-border bg-sidebar p-5">
    <span class="text-h2 font-bold leading-tight">Character chart</span>
    <span class="text-sm text-muted-foreground">
      All 104 characters, grouped and split by row. Tap one to hear it.
    </span>
  </div>

  {#each sections as section (section.group)}
    <Card
      title="{groupLabel(section.group)} {section.japanese}"
      description={section.description}
    >
      <div class="grid grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-2 lg:gap-x-8">
        {#each rowsInGroup(section.group) as row (row.id)}
          <ChartRow {row} columns={widest(section.group)} />
        {/each}
      </div>
    </Card>
  {/each}
</div>
