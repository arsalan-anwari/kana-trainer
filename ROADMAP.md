# Roadmap

This roadmap describes the direction of Kana Trainer. 

For shipped changes see the [CHANGELOG](CHANGELOG.md).

## Status legend

| Mark | Meaning |
|------|---------|
| ✅ | Done, released |
| 🚧 | In progress |
| 📋 | Planned, not started |
| 💡 | Idea, still being scoped |

## How versions map to milestones

- **v1.0.0 – v1.9.0**: *Foundation.* Build the app, make it correct, and make
  it scale across desktop, tablet and phone. Harden it with external testers.
  Split the UI into a reusable component library.
- **v2.0.0 and beyond**: *On-device AI tutor.* Add energy-efficient local
  models for pronunciation and handwriting practice, with real-time,
  delta-based feedback rather than a binary right/wrong.

## Guiding principles

- **Offline first.** The app works with no network. Anything added in v2 runs
  on the user's own device.
- **Battery matters.** A model that drains a phone after moderate use is not
  shippable. Energy cost is a first-class metric, profiled with
  [zinfer](#related-projects).
- **Fast enough for drilling.** Practising 1000+ characters in one sitting must
  not feel laggy. Per-character feedback is measured in micro/milli seconds, not
  seconds.
- **Tutor, not quiz.** Feedback says how far off and in which direction, and
  repeats until the learner gets it right.
- **One codebase, many screens.** The same app on a wide monitor and on a small
  phone with large accessibility fonts.

---

## Milestone: Foundation (v1.x)

### Core app ✅

- Hiragana, katakana or both, in either direction, single characters up to all
  147 including dakuon, handakuon, yoon and katakana tokushon
- Three question formats (text↔text, audio→text, text→audio), answered by
  multiple choice or typing
- Runs of 10–500 questions or one full pass, at three difficulty levels
- Optional time trial, per question and per run
- Chart view of every character grouped by sound type and row
- Score reports saved on disk, exported and imported as `.kt-report` files
- Packaged for Linux, Windows, macOS and Android

### Responsive and accessible layout 🚧

- ✅ Header, insets and prompt frame hold from extra-small phones to wide
  desktops
- ✅ Character grids scale their column count by container size and zoom level
  so text never gets clipped
- ✅ Multi-character rows (yoon, tokushon) scale against their container
- 🚧 Continue tightening layout against real devices reported by testers
- 📋 Full pass on screen-reader labels and focus order
- 📋 Keyboard-only navigation across every screen

### External testing 🚧

- 🚧 Collect visual and layout bugs from external testers across device classes
- 📋 Document a lightweight feedback and triage flow for testers
- 📋 Add regression tests (unit + Playwright) for each confirmed tester bug

### Decouple the UI as a library 📋

Goal: extract the Svelte components, theme and layout primitives into a
standalone package so sibling apps can share them.

- 📋 Identify components that are app-agnostic vs. kana-specific
- 📋 Move shared components, tokens and the cream-paper / black-ink theme into a
  separate package
- 📋 Define a stable public API and document it
- 📋 Consume the library back in Kana Trainer with no visual change
- 📋 Prove reuse by adopting it in [`kanji-trainer`](#related-projects) and
  [`jlpt-trainer`](#related-projects)

---

## Milestone: On-device AI tutor (v2.0.0+)

The shift in v2 is from a right/wrong quiz to a genuine tutor. Three problems,
each profiled for energy and latency with [zinfer](#related-projects).

### 1. Energy-efficient local models 📋

Current models for Japanese handwriting and speech are built for desktop-class
hardware and drain a phone battery after moderate use. And the mobile-first
models ae to simple to be useful, they are binary classifiers without intent. 

- 📋 Benchmark candidate architectures (not only dense LLMs) for accuracy vs.
  energy per inference using zinfer
- 📋 Target a per-character energy budget that supports a long practice session
  on battery
- 📋 Ship models that run fully on-device across the supported platforms

### 2. Real-time feedback latency 📋

Multi-second inference is fine for one character and painful for a thousand.

- 📋 Sub-second feedback per character
- 📋 Streaming / incremental evaluation while the user is still drawing or
  speaking
- 📋 Degrade gracefully on weaker hardware without blocking the drill

### 3. Delta-based, corrective feedback 📋

Existing tools are too deterministic: fixed stroke order, pixel overlap, or
discrete sound matching, and they ignore how much handwriting and speech vary
between people. The output is binary, like Duolingo. It should instead measure
how far off and in which direction, and coach in real time.

**Handwriting**

- 📋 Evaluate stroke direction, angle and path over time rather than pixel
  boundaries or a fixed stroke order
- 📋 Judge whether the intent is correct and the result is readable, not whether
  it matches one template
- 📋 Show, in real time, where a stroke diverged and how to adjust it

**Speech**

- 📋 Live feedback on pitch, tone and timing at each moment of the utterance
- 📋 Mouth-movement guidance toward the correct articulation
- 📋 Tolerate accent and speaker variation across ethnicities

### Tutor loop 📋

- 📋 Replace the pass/fail quiz result with a guided "try again" loop that
  repeats a character until the learner produces a readable / intelligible
  version
- 📋 Track improvement over time per character and per learner

---

## Related projects

| Project | Relationship |
|---------|--------------|
| **zinfer** | Library to benchmark and profile the **energy** cost of an AI/ML model (dense LLMs and other ML architectures). Used to run and profile every v2 model. Developed alongside Kana Trainer. |
| **kanji-trainer** | Planned sibling app. Consumer of the shared UI library. |
| **jlpt-trainer** | Planned sibling app. Consumer of the shared UI library. |

## Non-goals

- Online accounts, cloud sync of learning data, or server-side inference
- A full SRS / flashcard scheduler competing with dedicated tools
- Grammar or vocabulary instruction beyond kana and (later) kanji recognition.
