<script lang="ts">
  import { app } from "../state.svelte";
  import {
    perQuestionOptions,
    questionCountOptions,
    totalTimeOptions,
    type Direction,
    type Format
  } from "../core/settings";
  import type { Script } from "../core/kana";
  import Button from "../ui/Button.svelte";
  import Card from "../ui/Card.svelte";
  import Chip from "../ui/Chip.svelte";
  import OptionCard from "../ui/OptionCard.svelte";
  import Switch from "../ui/Switch.svelte";
  import KanaPicker from "./KanaPicker.svelte";

  const allFormats: { value: Format; label: string; hint: string }[] = [
    { value: "text-text", label: "Text only", hint: "Read a character, answer with text" },
    { value: "audio-text", label: "Audio to text", hint: "Hear a sound, answer with text" },
    { value: "text-audio", label: "Text to audio", hint: "Read a character, pick the sound" }
  ];

  const directions: { value: Direction; label: string; hint: string }[] = [
    { value: "kana-romaji", label: "Kana to romaji", hint: "Answer in romaji" },
    { value: "romaji-kana", label: "Romaji to kana", hint: "Answer in kana" },
    { value: "mixed", label: "Mixed", hint: "Both ways at random" }
  ];

  const formats = $derived(
    app.settings.includeDakuten
      ? allFormats.filter((format) => format.value === "text-text")
      : allFormats
  );
  const showAnswerStyle = $derived(app.settings.format !== "text-audio");
  const showDirection = $derived(app.settings.format === "text-text");
  const showDakuten = $derived(app.settings.format === "text-text");

  function toggleScript(script: Script): void {
    const set = new Set(app.settings.scripts);
    if (set.has(script)) set.delete(script);
    else set.add(script);
    app.updateSettings({ scripts: [...set] as Script[] });
  }

  function timeLabel(seconds: number): string {
    if (seconds === 0) return "Off";
    if (seconds < 60) return `${seconds}s`;
    return `${seconds / 60}m`;
  }
</script>

<div class="grid h-full min-h-0 grid-cols-[minmax(300px,1fr)_minmax(300px,420px)] gap-4 xl:gap-6">
  <div class="scroll-area -mr-2 flex min-h-0 flex-col gap-5 pr-2">
    <Card title="Alphabets" description="Pick what you want to see during the run.">
      <div class="grid grid-cols-2 gap-3">
        <OptionCard
          label="Hiragana"
          hint="あ い う え お"
          active={app.settings.scripts.includes("hiragana")}
          onclick={() => toggleScript("hiragana")}
        />
        <OptionCard
          label="Katakana"
          hint="ア イ ウ エ オ"
          active={app.settings.scripts.includes("katakana")}
          onclick={() => toggleScript("katakana")}
        />
      </div>
    </Card>

    <Card title="Question format" description="How each question is shown and answered.">
      <div class="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {#each formats as format (format.value)}
          <OptionCard
            label={format.label}
            hint={format.hint}
            active={app.settings.format === format.value}
            onclick={() => app.updateSettings({ format: format.value })}
          />
        {/each}
      </div>
    </Card>

    {#if showAnswerStyle}
      <Card title="Answer style" description="Tap one of four answers or type it yourself.">
        <div class="grid grid-cols-2 gap-3">
          <OptionCard
            label="Multiple choice"
            hint={app.settings.format === "audio-text"
              ? "Answer choices are always in kana"
              : "Choose one of 4 options"}
            active={app.settings.answerStyle === "choice"}
            onclick={() => app.updateSettings({ answerStyle: "choice" })}
          />
          <OptionCard
            label="Typing"
            hint={app.settings.format === "audio-text"
              ? "Accepts kana or romaji"
              : "Type the romaji or kana"}
            active={app.settings.answerStyle === "typing"}
            onclick={() => app.updateSettings({ answerStyle: "typing" })}
          />
        </div>
      </Card>
    {/if}

    {#if showDirection}
      <Card title="Direction" description="Which side you get and which side you answer.">
        <div class="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {#each directions as direction (direction.value)}
            <OptionCard
              label={direction.label}
              hint={direction.hint}
              active={app.settings.direction === direction.value}
              onclick={() => app.updateSettings({ direction: direction.value })}
            />
          {/each}
        </div>
      </Card>
    {/if}

    <Card title="Extras" description="Dakuten characters and sound.">
      <div class="flex flex-col gap-3">
        {#if showDakuten}
          <Switch
            label="Include dakuten and handakuten"
            hint="Disables all audio modes"
            checked={app.settings.includeDakuten}
            onchange={(value) => app.setDakuten(value)}
          />
        {/if}
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

    <Card title="Time trial" description="Leave both off for a relaxed run.">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Per question
          </span>
          <div class="flex flex-wrap gap-2">
            {#each perQuestionOptions as seconds (seconds)}
              <Chip
                size="sm"
                active={app.settings.perQuestionSeconds === seconds}
                onclick={() => app.updateSettings({ perQuestionSeconds: seconds })}
              >
                {timeLabel(seconds)}
              </Chip>
            {/each}
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Whole run
          </span>
          <div class="flex flex-wrap gap-2">
            {#each totalTimeOptions as seconds (seconds)}
              <Chip
                size="sm"
                active={app.settings.totalSeconds === seconds}
                onclick={() => app.updateSettings({ totalSeconds: seconds })}
              >
                {timeLabel(seconds)}
              </Chip>
            {/each}
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Questions
          </span>
          <div class="flex flex-wrap gap-2">
            {#each questionCountOptions as count (count)}
              <Chip
                size="sm"
                active={app.settings.questionCount === count}
                onclick={() => app.updateSettings({ questionCount: count })}
              >
                {count}
              </Chip>
            {/each}
            <Chip
              size="sm"
              active={app.settings.questionCount === 0}
              onclick={() => app.updateSettings({ questionCount: 0 })}
            >
              One pass
            </Chip>
          </div>
        </div>
      </div>
    </Card>
  </div>

  <div class="flex h-full min-h-0 flex-col gap-4">
    <Card
      class="flex min-h-0 flex-1 flex-col"
      contentClass="flex min-h-0 flex-1 flex-col"
      title="Characters" description="Tap a row label to take the whole row.">
      <KanaPicker />
    </Card>

    <div class="flex flex-col gap-3 rounded-xl border border-border bg-sidebar p-4">
      {#if app.notes.length > 0}
        <ul class="flex flex-col gap-1">
          {#each app.notes as note (note)}
            <li class="text-xs leading-snug text-muted-foreground">{note}</li>
          {/each}
        </ul>
      {/if}
      {#if app.message !== ""}
        <p class="text-xs font-semibold leading-snug text-success">{app.message}</p>
      {/if}
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted-foreground">Characters in play</span>
        <span class="font-semibold">{app.eligibleCount}</span>
      </div>
      <Button size="lg" variant="brand" full disabled={app.eligibleCount === 0} onclick={() => app.start()}>
        Start run
      </Button>
    </div>
  </div>
</div>
