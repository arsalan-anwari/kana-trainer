import { allKana, kanaById, rows, rowsInGroup, seionRows, type Script } from "./core/kana";
import {
  buildQuestions,
  checkChoice,
  checkTyped,
  eligibleKana,
  eligiblePairs,
  type Answer,
  type Choice,
  type Question
} from "./core/quiz";
import {
  defaultSettings,
  groupFlag,
  migrateSettings,
  normalizeSettings,
  optionalGroups,
  selectionFor,
  usesAudio,
  withSelection,
  type LegacySettings,
  type OptionalGroup,
  type RunSettings
} from "./core/settings";
import { summarize, weakKanaIds, type Report, type Summary } from "./core/report";
import { scoreTier, type ScoreTier } from "./core/score";
import { kanaAudio, setEffectsEnabled, sfx } from "./audio";
import { listReports, loadJson, saveReport, storeJson } from "./storage";

export type Route = "setup" | "quiz" | "result" | "reports" | "chart";
export type Phase = "answering" | "feedback" | "done";

const SETTINGS_KEY = "kana-trainer-settings";
const PREFS_KEY = "kana-trainer-prefs";

export type Prefs = {
  effects: boolean;
  theme: "system" | "light" | "dark";
};

function newId(): string {
  const stamp = Date.now().toString(36);
  const noise = Math.floor(Math.random() * 1e6).toString(36);
  return `${stamp}-${noise}`;
}

function startingSelection(): string[] {
  return seionRows.flatMap((row) => row.kana.map((kana) => kana.id));
}

const scripts: Script[] = ["hiragana", "katakana"];

class AppState {
  route = $state<Route>("setup");
  settings = $state<RunSettings>({
    ...defaultSettings,
    selections: { hiragana: startingSelection(), katakana: startingSelection() }
  });
  prefs = $state<Prefs>({ effects: true, theme: "system" });
  notes = $state<string[]>([]);
  reports = $state<Report[]>([]);
  message = $state<string>("");

  questions = $state<Question[]>([]);
  answers = $state<Answer[]>([]);
  index = $state(0);
  phase = $state<Phase>("answering");
  typed = $state("");
  picked = $state<Choice | null>(null);
  staged = $state<Choice | null>(null);
  lastCorrect = $state(false);
  lastReport = $state<Report | null>(null);
  /** The grade of the run just finished, while its splash is still up. */
  splash = $state<ScoreTier | null>(null);

  /** Which alphabet the character picker is editing when both are on. */
  pickerChoice = $state<Script>("hiragana");

  /** Whether the "stop this run" question is on screen. */
  confirmQuit = $state(false);
  /** When the run was put on hold for that question, so it can be given back. */
  pausedAt = 0;
  /** Where to land once the run is abandoned. */
  quitTo: Route = "setup";

  now = $state(0);
  questionStartedAt = $state(0);
  runStartedAt = $state(0);
  timer: ReturnType<typeof setInterval> | null = null;

  pickerScript = $derived<Script>(
    this.settings.scripts.includes(this.pickerChoice)
      ? this.pickerChoice
      : (this.settings.scripts[0] ?? "hiragana")
  );
  selection = $derived(selectionFor(this.settings, this.pickerScript));

  current = $derived(this.questions[this.index] ?? null);
  progress = $derived(
    this.questions.length === 0 ? 0 : (this.index / this.questions.length) * 100
  );
  score = $derived(this.answers.filter((answer) => answer.correct).length);
  eligibleCount = $derived(eligiblePairs(this.settings).length);
  questionRemaining = $derived(
    this.settings.perQuestionSeconds === 0
      ? null
      : Math.max(
          0,
          this.settings.perQuestionSeconds * 1000 - (this.now - this.questionStartedAt)
        )
  );
  totalRemaining = $derived(
    this.settings.totalSeconds === 0
      ? null
      : Math.max(0, this.settings.totalSeconds * 1000 - (this.now - this.runStartedAt))
  );

  load(): void {
    const storedSettings = loadJson<LegacySettings | null>(SETTINGS_KEY, null);
    if (storedSettings !== null) {
      this.settings = migrateSettings(storedSettings);
      for (const script of scripts) {
        if (this.settings.selections[script].length === 0) {
          this.settings.selections[script] = startingSelection();
        }
      }
      const result = normalizeSettings(this.settings);
      this.settings = result.settings;
      this.notes = result.notes;
    }
    this.prefs = loadJson<Prefs>(PREFS_KEY, this.prefs);
    this.applyPrefs();
    void this.refreshReports();
  }

  applyPrefs(): void {
    setEffectsEnabled(this.prefs.effects);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (this.prefs.theme !== "system") root.classList.add(this.prefs.theme);
    storeJson(PREFS_KEY, this.prefs);
  }

  updateSettings(patch: Partial<RunSettings>): void {
    const merged = { ...this.settings, ...patch };
    const result = normalizeSettings(merged);
    this.settings = result.settings;
    this.notes = result.notes;
    storeJson(SETTINGS_KEY, this.settings);
  }

  /** The picker edits one alphabet at a time, so every edit lands on that one. */
  usePicker(script: Script): void {
    sfx.click();
    this.pickerChoice = script;
  }

  toggleKana(id: string): void {
    const selection = new Set(this.selection);
    if (selection.has(id)) selection.delete(id);
    else selection.add(id);
    sfx.select();
    this.updateSettings({
      selections: withSelection(this.settings, this.pickerScript, [...selection])
    });
  }

  toggleRow(rowId: string): void {
    const row = rows.find((item) => item.id === rowId);
    if (!row) return;
    const selection = new Set(this.selection);
    const complete = row.kana.every((kana) => selection.has(kana.id));
    for (const kana of row.kana) {
      if (complete) selection.delete(kana.id);
      else selection.add(kana.id);
    }
    sfx.select();
    this.updateSettings({
      selections: withSelection(this.settings, this.pickerScript, [...selection])
    });
  }

  /** Extra sets are a property of the run, so they land on both alphabets. */
  setGroup(group: OptionalGroup, value: boolean): void {
    const selections = { ...this.settings.selections };
    for (const script of scripts) {
      const selection = new Set(selections[script]);
      for (const row of rowsInGroup(group)) {
        for (const kana of row.kana) {
          if (value) selection.add(kana.id);
          else selection.delete(kana.id);
        }
      }
      selections[script] = [...selection];
    }
    this.updateSettings({
      [groupFlag(group)]: value,
      selections
    } as Partial<RunSettings>);
  }

  setSelection(ids: string[]): void {
    sfx.select();
    this.updateSettings({
      selections: withSelection(this.settings, this.pickerScript, ids)
    });
  }

  async refreshReports(): Promise<void> {
    this.reports = await listReports();
  }

  start(): void {
    const result = normalizeSettings(this.settings);
    this.settings = result.settings;
    this.notes = result.notes;
    storeJson(SETTINGS_KEY, this.settings);

    const questions = buildQuestions(this.settings);
    if (questions.length === 0) {
      this.message = "Pick at least one character that fits the selected mode.";
      return;
    }

    if (usesAudio(this.settings.format)) {
      kanaAudio.preload(eligibleKana(this.settings).map((kana) => kana.audio));
    }

    this.message = "";
    this.questions = questions;
    this.answers = [];
    this.index = 0;
    this.phase = "answering";
    this.typed = "";
    this.picked = null;
    this.staged = null;
    this.splash = null;
    this.confirmQuit = false;
    this.route = "quiz";
    this.now = Date.now();
    this.runStartedAt = this.now;
    this.questionStartedAt = this.now;
    sfx.start();
    this.startTimer();
    this.speakPrompt();
  }

  startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => this.tick(), 100);
  }

  stopTimer(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
  }

  tick(): void {
    this.now = Date.now();
    if (this.phase !== "answering") return;
    if (this.totalRemaining !== null && this.totalRemaining <= 0) {
      this.finish();
      return;
    }
    if (this.questionRemaining !== null && this.questionRemaining <= 0) {
      this.recordAnswer(false, true, "");
    }
  }

  speakPrompt(): void {
    const question = this.current;
    if (question === null || question.prompt !== "audio") return;
    const kana = kanaById(question.kanaId);
    void kanaAudio.play(kana?.audio ?? null);
  }

  replayPrompt(): void {
    this.speakPrompt();
  }

  playChoice(choice: Choice): void {
    const kana = kanaById(choice.kanaId);
    void kanaAudio.play(kana?.audio ?? null);
  }

  /**
   * Text to audio answers are staged rather than submitted: tapping a sound
   * plays it and marks it as the pick, and the check button commits it.
   */
  stageChoice(choice: Choice): void {
    if (this.phase !== "answering" || this.current === null) return;
    this.staged = choice;
    this.playChoice(choice);
  }

  submitStaged(): void {
    if (this.staged === null) return;
    this.answerChoice(this.staged);
  }

  recordAnswer(correct: boolean, timedOut: boolean, given: string): void {
    const question = this.current;
    if (question === null) return;
    this.answers = [
      ...this.answers,
      {
        kanaId: question.kanaId,
        script: question.script,
        correct,
        timedOut,
        elapsedMs: Date.now() - this.questionStartedAt,
        given
      }
    ];
    this.lastCorrect = correct;
    this.phase = "feedback";
    if (correct) {
      sfx.correct();
      setTimeout(() => {
        if (this.phase === "feedback") this.next();
      }, 700);
    } else {
      sfx.wrong();
    }
  }

  answerChoice(choice: Choice): void {
    if (this.phase !== "answering" || this.current === null) return;
    this.picked = choice;
    const kana = kanaById(choice.kanaId);
    this.recordAnswer(checkChoice(this.current, choice), false, kana?.romaji ?? "");
  }

  submitTyped(): void {
    if (this.phase !== "answering" || this.current === null) return;
    if (this.typed.trim() === "") return;
    const acceptEitherScript = this.settings.format === "audio-text";
    this.recordAnswer(
      checkTyped(this.current, this.typed, acceptEitherScript),
      false,
      this.typed.trim()
    );
  }

  next(): void {
    if (this.index + 1 >= this.questions.length) {
      this.finish();
      return;
    }
    this.index += 1;
    this.phase = "answering";
    this.typed = "";
    this.picked = null;
    this.staged = null;
    this.questionStartedAt = Date.now();
    this.now = this.questionStartedAt;
    this.speakPrompt();
  }

  finish(): void {
    this.stopTimer();
    kanaAudio.stop();
    this.phase = "done";
    const report: Report = {
      id: newId(),
      createdAt: new Date().toISOString(),
      durationMs: Date.now() - this.runStartedAt,
      settings: { ...this.settings },
      answers: this.answers
    };
    this.lastReport = report;
    this.route = "result";
    const summary = summarize(this.answers);
    this.splash = scoreTier(summary.accuracy, summary.total);
    sfx.score(this.splash);
    void saveReport(report).then(() => this.refreshReports());
  }

  /**
   * Puts the run on hold and asks. The clock stops with it, so a run cannot
   * time out underneath the question, and thinking time is not charged for.
   */
  askQuit(to: Route = "setup"): void {
    if (this.confirmQuit) return;
    this.stopTimer();
    kanaAudio.stop();
    this.quitTo = to;
    this.pausedAt = Date.now();
    this.confirmQuit = true;
  }

  cancelQuit(): void {
    if (!this.confirmQuit) return;
    this.confirmQuit = false;
    const held = Date.now() - this.pausedAt;
    this.runStartedAt += held;
    this.questionStartedAt += held;
    this.now = Date.now();
    this.startTimer();
  }

  /**
   * Abandons the run outright. A run that was not seen through is not a run:
   * nothing is scored, nothing is saved and there is no splash for it.
   */
  quit(): void {
    this.stopTimer();
    kanaAudio.stop();
    this.confirmQuit = false;
    this.questions = [];
    this.answers = [];
    this.index = 0;
    this.phase = "answering";
    this.typed = "";
    this.picked = null;
    this.staged = null;
    this.splash = null;
    this.navigate(this.quitTo);
    this.quitTo = "setup";
  }

  dismissSplash(): void {
    this.splash = null;
  }

  summary(): Summary {
    return summarize(this.answers);
  }

  practiceMistakes(answers: Answer[]): void {
    const ids = weakKanaIds(answers);
    if (ids.length === 0) {
      this.message = "No mistakes found to practice.";
      return;
    }
    // a miss belongs to the alphabet it was made in, so each side gets its own
    const selections = { hiragana: [] as string[], katakana: [] as string[] };
    for (const script of scripts) {
      const inScript = weakKanaIds(answers.filter((answer) => answer.script === script));
      selections[script] = inScript.length > 0 ? inScript : ids;
    }

    const patch: Partial<RunSettings> = { selections };
    for (const group of optionalGroups) {
      if (ids.some((id) => kanaById(id)?.group === group)) {
        Object.assign(patch, { [groupFlag(group)]: true });
      }
    }
    this.updateSettings(patch);
    this.splash = null;
    this.route = "setup";
    this.message = `Loaded ${ids.length} characters you missed into the practice set.`;
  }

  go(route: Route): void {
    sfx.click();
    // walking away from a run is stopping it, so it gets the same question
    if (this.route === "quiz" && route !== "quiz" && this.questions.length > 0) {
      this.askQuit(route);
      return;
    }
    this.splash = null;
    this.navigate(route);
  }

  private navigate(route: Route): void {
    if (this.route === "chart" && route !== "chart") kanaAudio.stop();
    this.route = route;
    this.message = "";
    if (route === "reports") void this.refreshReports();
  }
}

export const app = new AppState();

export const totalKanaCount = allKana.length;
