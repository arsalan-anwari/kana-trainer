# kana-trainer

[![crates.io](https://img.shields.io/crates/v/kana-trainer.svg)](https://crates.io/crates/kana-trainer)
[![downloads](https://img.shields.io/crates/d/kana-trainer.svg)](https://crates.io/crates/kana-trainer)
[![CI](https://github.com/arsalan-anwari/kana-trainer/actions/workflows/ci.yml/badge.svg)](https://github.com/arsalan-anwari/kana-trainer/actions/workflows/ci.yml)
[![license](https://img.shields.io/crates/l/kana-trainer.svg)](LICENSE)

Trainer for the hiragana and katakana alphabets, on desktop, tablet and phone.
Built with Tauri 2 and Svelte 5, in cream paper and black ink.

<table>
  <tr>
    <td align="center" valign="bottom">
      <img src="docs/showcase.gif" width="420"
           alt="Kana Trainer on a desktop window, walking through the practice setup, the three question formats, a run result, the reports screen and the character chart">
    </td>
    <td align="center" valign="bottom">
      <img src="docs/showcase-phone.gif" width="160"
           alt="The same walkthrough of Kana Trainer on a phone screen">
    </td>
  </tr>
  <tr>
    <td align="center">
      <b>Desktop</b><br>
    </td>
    <td align="center">
      <b>Phone</b><br>
    </td>
  </tr>
</table>

## What it does

- Responsive interface, the same app on a wide screen and on a phone
- Practice hiragana, katakana or both, in either direction (kana to romaji, romaji to kana or mixed)
- Three question formats: text to text, audio to text, and text to audio with a waveform for each sound
- Two answer styles: multiple choice with four options, or typing the romaji yourself
- Time trial with 5, 10, 15 or 30 seconds per question and an optional limit for the whole run
- Pick single characters, whole rows, or the characters you keep getting wrong
- Optional dakuon, handakuon and yoon rows on top of the 46 seion characters, all with audio
- Chart view with all 104 characters grouped by sound type and row, tap any tile to hear it
- Score reports saved on disk, loaded and exported as JSON files
- Charts for the characters, rows and alphabets you struggle with
- One click to turn past mistakes into a new practice set

## Installing

From crates.io:

```sh
cargo install kana-trainer
```

Download pages at [releases page](https://github.com/arsalan-anwari/kana-trainer/releases).

```sh
sudo dnf install ./kana-trainer-*.rpm            # fedora, opensuse
sudo apt install ./kana-trainer_*.deb            # debian 13+, ubuntu 24.04+
sudo pacman -U ./kana-trainer-*.pkg.tar.zst      # arch
adb install ./kana-trainer-*.apk                 # android
```

## Building

### Requirements

- Rust 1.77 or newer
- Node 20 or newer
- On Linux: webkit2gtk 4.1, gtk3 and the distro base build tools

### Commands

```sh
npm install
npm run tauri:dev     # the app
npm run check         # type check
npm run test          # unit tests
npm run test:e2e      # playwright smoke test
```

## Keyboard Shortcuts

- `1` to `4` picks an answer in multiple choice
- `Enter` submits a typed answer, submits the picked sound in text to audio, and
  moves on after feedback
- `r` replays the sound in audio questions
- `Escape` leaves the run

## Credits

- Character sounds from [veardk/just-gojuon](https://github.com/veardk/just-gojuon) (MIT), pitch and loudness normalised with `scripts/normalize-audio.py`
