import { expect, test, type Page } from "@playwright/test";
import { allKana, seionRows } from "../../src/lib/core/kana";
import { applySeed, seedPayload } from "./seed";
import { installStage, Stage } from "./stage";

const intro = { title: "Kana Trainer", lines: ["Hiragana and katakana practice"] };

const outro = {
  title: "Kana Trainer",
  lines: [
    "Free and open source. Desktop, tablet and phone",
    "Download at: https://arsalan-anwari.github.io/kana-trainer/",
  ]
};

/** The character behind a glyph or a romaji reading shown on screen. */
function resolve(text: string) {
  const value = text.trim();
  const found = allKana.find(
    (kana) => kana.hira === value || kana.kata === value || kana.romaji === value
  );
  if (found === undefined) throw new Error(`no kana matches ${JSON.stringify(value)}`);
  return found;
}

/** What the prompt frame is showing, empty for an audio prompt. */
async function promptText(page: Page): Promise<string> {
  return (await page.locator("main .border-wire").first().innerText()).trim();
}

const tiles = (page: Page) => page.locator("main button.aspect-square");

/**
 * Waits until the question on screen is the one being answered.
 */
async function answering(page: Page): Promise<void> {
  await expect(tiles(page).first()).toBeEnabled();
}

/** The label under the slot number of each multiple choice tile. */
async function tileLabels(page: Page): Promise<string[]> {
  const texts = await tiles(page).allInnerTexts();
  return texts.map((text) => text.trim().split("\n").filter(Boolean).pop()?.trim() ?? "");
}

function slotOf(labels: string[], reading: string): number {
  const target = resolve(reading);
  return labels.findIndex(
    (label) => label === target.romaji || label === target.hira || label === target.kata
  );
}

/**
 * Which recorded clip the shared audio element is holding.
 */
async function playingClip(page: Page, candidates: string[]): Promise<string | null> {
  return page.evaluate(async (names) => {
    const element = document.querySelector<HTMLAudioElement>("[data-kana-audio]");
    if (element === null || element.src === "") return null;
    const current = new Uint8Array(await (await fetch(element.src)).arrayBuffer());
    const clips = await Promise.all(
      names.map(async (name) => {
        const response = await fetch(`/audio/${name}.mp3`);
        return { name, bytes: response.ok ? new Uint8Array(await response.arrayBuffer()) : null };
      })
    );
    for (const clip of clips) {
      if (clip.bytes === null || clip.bytes.length !== current.length) continue;
      let same = true;
      for (let index = 0; index < clip.bytes.length; index += 331) {
        if (clip.bytes[index] !== current[index]) {
          same = false;
          break;
        }
      }
      if (same) return clip.name;
    }
    return null;
  }, candidates);
}

const everyReading = seionRows.flatMap((row) => row.kana.map((kana) => kana.romaji));

/** How many questions the closing run is, one for each character left in play. */
const FINALE = 5;

test("record the promo", async ({ page }) => {
  const stage = new Stage(page);

  await page.addInitScript(applySeed, seedPayload());
  await page.addInitScript(installStage, intro);
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start run" })).toBeEnabled();

  const button = (name: string | RegExp, exact = false) =>
    page.getByRole("button", { name, exact });
  const startRun = button("Start run");
  const backToSetup = button("Practice", true);
  const discard = button("Stop and discard");

  /** Leaves a half finished run, which asks before it throws the answers away. */
  const abandon = async (settle = 220): Promise<void> => {
    await stage.tap(backToSetup, 240);
    await stage.tap(discard, settle);
  };

  // title card
  await stage.beat(650);
  await stage.hideCard();

  // setting up a run
  await stage.caption("Hiragana, katakana, or both");
  await stage.tap(button("Katakana"), 200);
  stage.mark("alphabets");

  // a set of characters per alphabet, behind a tab each
  await stage.caption("Each alphabet has its own set");
  await stage.tap(page.getByRole("tab", { name: "Katakana" }), 240);
  await stage.tap(button("K-row", true), 200);
  await stage.tap(page.getByRole("tab", { name: "Hiragana" }), 260);
  stage.mark("alphabet tabs");

  // how long the run is and how hard it pushes
  await stage.caption("10 to 500 questions, or one pass over the set");
  await stage.tap(button("100", true), 240);
  await stage.tap(button("One pass", true), 280);
  await stage.caption("Harder difficulty, closer wrong answers");
  await stage.tap(button("Expert"), 300);
  stage.mark("settings");

  await stage.caption("Time each question. Pick rows or single characters");
  await stage.tap(button("15s"), 240);
  await stage.scroll(0, 240);
  await stage.tap(button("Select all"), 160);
  stage.mark("setup");

  // run one: hear a character, type the reading
  await stage.caption("Audio to text: hear it, type it");
  await stage.tap(button("Typing"), 120);
  await stage.tap(button("Audio to text"), 140);
  await stage.tap(startRun, 550);
  await stage.frame("main .anim-pop");

  const heard = await playingClip(page, everyReading);
  await stage.type(heard ?? "a");
  await stage.beat(120);
  await stage.press("Enter", 450);
  stage.mark("audio run");

  // walking out of a run asks first, and nothing half done is kept
  await stage.caption("Quit early and nothing is saved");
  await stage.tap(backToSetup, 700);
  await stage.tap(discard, 200);
  await stage.hideCaption();
  stage.mark("quit");

  // run two: pick the matching sound
  await stage.caption("Text to audio: pick the sound");
  await stage.tap(button("Text to audio"), 140);
  await stage.tap(startRun, 240);
  await stage.frame("main .anim-pop");

  const wanted = resolve(await promptText(page)).romaji;
  for (let slot = 1; slot <= 4; slot += 1) {
    await stage.tap(page.getByRole("button", { name: `Sound ${slot}` }), 180, true);
    if ((await playingClip(page, [wanted])) === wanted) break;
  }
  await stage.tap(button("Check"), 420, true);
  stage.mark("sound run");

  // the closing run: short enough to see through, so the score is real
  await abandon(140);
  await stage.caption("One pass covers exactly what you picked");
  await stage.tap(button("Text only"), 140);
  await stage.tap(button("Katakana"), 160);
  await stage.tap(button("Clear", true), 160);
  await stage.tap(button("A-row", true), 240);
  await stage.tap(startRun, 420);
  await stage.frame("main .anim-pop");

  // the first two by hand, one right and one wrong, the rest on the keys
  await stage.caption("Text only: read it, tap the reading");
  await answerChoice(page, stage, true);
  await stage.beat(320);

  // the feedback panel lands where the caption sits, so the pill steps aside
  await stage.hideCaption();
  await answerChoice(page, stage, false);
  await stage.beat(750);
  await stage.tap(button("Continue"), 140);

  await stage.caption("Shortcut keys 1 to 4 work too");
  for (let question = 3; question <= FINALE; question += 1) {
    await answering(page);
    await stage.press(String(slotOf(await tileLabels(page), await promptText(page)) + 1), 420);
  }
  await stage.hideCaption();
  stage.mark("finale run");

  // the grade for the run: an emoji, confetti, and then it clears itself
  await stage.beat(3000);
  stage.mark("splash");

  await stage.caption("Finish a run and it gets scored and saved");
  await stage.scroll(430, 400);
  await stage.beat(250);
  await stage.caption("Turn your misses into the next run");
  await stage.hover(button("Practice my mistakes"), 280);
  stage.mark("result");

  // the reports screen
  await stage.hideCaption();
  await stage.scroll(0, 240);
  await stage.tap(button("Reports", true), 300);
  await stage.caption("Every run kept, on your machine only");
  await stage.beat(420);
  await stage.caption("Look back a day, a week or a month");
  await stage.tap(button("Last week", true), 320);
  await stage.tap(page.getByRole("button", { name: "Select every run shown" }), 380);
  await stage.caption("See which rows trip you up");
  await stage.show(page.getByText("Mistakes by group"), 900);
  await stage.scroll(0, 240);
  stage.mark("reports");

  // the history leaves the machine and comes back: the picked runs go out to
  // one file, get wiped, and are read back in from that same file
  await stage.caption("Export the runs you picked to one file");
  const saved = page.waitForEvent("download");
  await stage.tap(button(/^Export/), 300);
  const file = await (await saved).path();
  await stage.beat(400);

  await stage.caption("Removing asks first, and takes the whole selection");
  await stage.tap(button(/^Remove \d+ selected/), 300);
  // long enough on the dialog to read what it is about to throw away
  await stage.beat(950);
  await stage.tap(button(/^Remove \d+ runs?$/), 500);

  await stage.caption("One .kt-report file moves them to another device");
  const picker = page.waitForEvent("filechooser");
  await stage.tap(button(/^Import runs/), 200);
  await (await picker).setFiles(file);
  await stage.beat(900);
  await stage.hideCaption();
  stage.mark("transfer");

  // the character chart
  await stage.caption("Swipe, or Shift and an arrow key, to change screen");
  await stage.press("Shift+ArrowRight", 520);
  await stage.caption("Every character in one chart. Tap to hear it");
  await stage.tap(button("Play ka", true), 560);
  await stage.beat(200);
  await stage.caption("Voiced and contracted rows too");
  await stage.tap(button("Play kyo", true), 560);
  await stage.beat(320);

  // light or dark, from the header
  await stage.caption("Light, dark, or system default theme.");
  await stage.tap(page.getByRole("button", { name: "Theme: light" }), 700);
  await stage.tap(page.getByRole("button", { name: "Theme: dark" }), 500);

  await stage.caption("Scale the whole app to fit the screen it is on");
  const zoomOut = page.getByRole("button", { name: "Zoom out" });
  const zoomIn = page.getByRole("button", { name: "Zoom in" });
  await stage.tap(zoomOut, 260);
  await stage.tap(zoomOut, 480);
  await stage.tap(zoomIn, 260);
  await stage.tap(zoomIn, 480);

  await stage.caption("Or a high contrast palette, when that reads easier");
  const contrast = page.getByRole("button", { name: "High contrast theme" });
  await stage.tap(contrast, 900);
  await stage.tap(contrast, 300);
  await stage.hideCaption();
  await stage.scroll(0, 300);
  stage.mark("chart");

  // end card
  await stage.card(outro, 1600);
  stage.mark("end");
});

/** Answers the multiple choice question on screen, right or wrong on purpose. */
async function answerChoice(page: Page, stage: Stage, correct: boolean): Promise<void> {
  await answering(page);
  const labels = await tileLabels(page);
  const right = slotOf(labels, await promptText(page));
  const index = correct ? right : labels.findIndex((_, slot) => slot !== right);
  await stage.tap(tiles(page).nth(index), 200, true);
}
