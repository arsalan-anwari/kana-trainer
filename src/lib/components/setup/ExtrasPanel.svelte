<script lang="ts">
  import { optionalGroups, groupFlag } from "../../core/settings";
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import Switch from "../../ui/Switch.svelte";

  const sets = [
    { group: optionalGroups[0], label: "Dakuon", hint: "が ざ だ ば rows" },
    { group: optionalGroups[1], label: "Handakuon", hint: "ぱ row" },
    { group: optionalGroups[2], label: "Yoon", hint: "きゃ しゃ ちゃ and the rest" }
  ];
</script>

<Card title="Extras" description="Extra character sets and sound.">
  <div class="flex flex-col gap-3">
    {#each sets as set (set.group)}
      <Switch
        label={set.label}
        hint={set.hint}
        checked={app.settings[groupFlag(set.group)] === true}
        onchange={(value) => app.setGroup(set.group, value)}
      />
    {/each}
    <Switch
      label="Sound effects"
      hint="Clicks and answer feedback"
      checked={app.prefs.effects}
      onchange={(value) => {
        app.prefs.effects = value;
        app.applyPrefs();
      }}
    />
  </div>
</Card>
