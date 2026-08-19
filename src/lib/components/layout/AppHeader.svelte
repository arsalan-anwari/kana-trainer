<script lang="ts">
  import { app } from "../../state.svelte";
  import Button from "../../ui/Button.svelte";
  import AppMark from "./AppMark.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
</script>

<header class="flex flex-wrap items-center justify-between gap-3">
  <div class="flex items-center gap-3">
    <AppMark class="size-10 text-h3 sm:size-11" />
    <div class="flex flex-col">
      <span class="text-h4 font-bold leading-tight">Kana Trainer</span>
      <span class="hidden text-xs text-muted-foreground sm:block">
        Hiragana and katakana practice
      </span>
    </div>
  </div>
  <nav class="flex items-center gap-2">
    <Button
      size="sm"
      variant={app.route === "setup" ? "secondary" : "ghost"}
      onclick={() => app.go("setup")}
    >
      Practice
    </Button>
    <Button
      size="sm"
      variant={app.route === "reports" ? "secondary" : "ghost"}
      onclick={() => app.go("reports")}
    >
      Reports
    </Button>
    <ThemeToggle />
  </nav>
</header>
