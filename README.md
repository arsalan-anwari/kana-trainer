# kana-trainer

[![crates.io](https://img.shields.io/crates/v/kana-trainer.svg)](https://crates.io/crates/kana-trainer)
[![downloads](https://img.shields.io/crates/d/kana-trainer.svg)](https://crates.io/crates/kana-trainer)
[![CI](https://github.com/arsalan-anwari/kana-trainer/actions/workflows/ci.yml/badge.svg)](https://github.com/arsalan-anwari/kana-trainer/actions/workflows/ci.yml)
[![license](https://img.shields.io/crates/l/kana-trainer.svg)](LICENSE)

Trainer for the hiragana and katakana alphabets, on desktop, tablet and phone.
Built with Tauri 2 and Svelte 5, in cream paper and black ink.

![Showcase of kana-trainer's practice setup, the three quiz formats, run results and the reports screen](docs/showcase.gif)

## What it does

- Responsive interface, the same app on a wide screen and on a phone
- Practice hiragana, katakana or both, in either direction (kana to romaji, romaji to kana or mixed)
- Three question formats: text to text, audio to text, and text to audio with a waveform for each sound
- Two answer styles: multiple choice with four options, or typing the romaji yourself
- Time trial with 5, 10, 15 or 30 seconds per question and an optional limit for the whole run
- Pick single characters, whole rows, or the characters you keep getting wrong
- Optional dakuten and handakuten rows (text to text only for now)
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
sudo apt install ./kana-trainer_*.deb            # debian 12+, ubuntu 22.04+
chmod +x ./kana-trainer_*.AppImage && ./kana-trainer_*.AppImage
sudo pacman -U ./kana-trainer-*.pkg.tar.zst      # arch
flatpak install --user ./kana-trainer-*.flatpak  # any distro with flatpak
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

- Character sounds from [digitaIfabric/japanese](https://github.com/digitaIfabric/japanese)
