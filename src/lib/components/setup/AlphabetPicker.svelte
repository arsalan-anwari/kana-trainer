<script lang="ts">
  import type { Script } from "../../core/kana";
  import { app } from "../../state.svelte";
  import Card from "../../ui/Card.svelte";
  import OptionCard from "../../ui/OptionCard.svelte";

  function toggle(script: Script): void {
    const set = new Set(app.settings.scripts);
    if (set.has(script)) set.delete(script);
    else set.add(script);
    app.updateSettings({ scripts: [...set] as Script[] });
  }
</script>

<Card title="Alphabets" description="Pick what you want to see during the run.">
  <div class="grid grid-cols-2 gap-3">
    <OptionCard
      label="Hiragana"
      hint="あ い う え お"
      active={app.settings.scripts.includes("hiragana")}
      onclick={() => toggle("hiragana")}
    />
    <OptionCard
      label="Katakana"
      hint="ア イ ウ エ オ"
      active={app.settings.scripts.includes("katakana")}
      onclick={() => toggle("katakana")}
    />
  </div>
</Card>
