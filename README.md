# kana-trainer

<a href="https://crates.io/crates/kana-trainer"><img src="https://img.shields.io/crates/v/kana-trainer.svg?style=flat-square" alt="crates.io" /></a>
<a href="https://github.com/arsalan-anwari/kana-trainer/releases"><img src="https://img.shields.io/github/downloads/arsalan-anwari/kana-trainer/total?style=flat-square" alt="GitHub Downloads" /></a>
<a href="https://crates.io/crates/kana-trainer"><img src="https://img.shields.io/crates/d/kana-trainer.svg?style=flat-square" alt="Crates Downloads" /></a>
<a href="https://github.com/arsalan-anwari/kana-trainer/actions/workflows/ci.yml"><img src="https://github.com/arsalan-anwari/kana-trainer/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
<a href="LICENSE"><img src="https://img.shields.io/crates/l/kana-trainer.svg?style=flat-square" alt="license" /></a>
<a href="https://arsalan-anwari.github.io/kana-trainer/"><img src="https://img.shields.io/badge/Docs-1a1b27?style=flat-square&logo=readthedocs&logoColor=white&labelColor=0d1117" alt="Docs" /></a>

Trainer for the hiragana and katakana alphabets, on desktop, tablet and phone.
Built with Tauri 2 and Svelte 5, in cream paper and black ink.

<table>
  <tr>
    <td align="center" valign="bottom">
      <img src="docs/showcase.gif" width="420"
           alt="Kana Trainer on a desktop window, walking through the practice setup, the three question formats, a character set per alphabet, the run length and difficulty, a run stopped and a run scored, the reports screen and the character chart">
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

## Features

- Hiragana, katakana or both, in either direction, from single characters up to all 104 including the dakuon, handakuon and yoon rows
- Three question formats (text to text, audio to text, text to audio) and answers by multiple choice or typing
- Runs of 10 to 500 questions or one pass over the set, at three difficulty levels that decide how look alike the wrong answers are
- Optional time trial, per question and for the whole run
- Chart view of every character grouped by sound type and row, tap a tile to hear it
- Score reports saved on disk and exportable as JSON, with charts of what you keep missing and one click to practice it again
- Responsive interface, the same app on a wide screen and on a phone

## Installing

### Manually

[https://arsalan-anwari.github.io/kana-trainer/](https://arsalan-anwari.github.io/kana-trainer/)

```sh
sudo dnf install ./kana-trainer-*.rpm            # fedora, opensuse
sudo apt install ./kana-trainer_*.deb            # debian 13+, ubuntu 24.04+
sudo pacman -U ./kana-trainer-*.pkg.tar.zst      # arch
adb install ./kana-trainer-*.apk                 # android
```

Or run exe/dmg package with your OS package installer. 

### From crates.io

```sh
cargo install kana-trainer
```


## Keyboard Shortcuts

- `1` to `4` picks an answer in multiple choice
- `Enter` submits a typed answer, submits the picked sound in text to audio, and
  moves on after feedback
- `r` replays the sound in audio questions
- `Escape` leaves the run

## Credits

- Character sounds from [Learn Japanese Adventure](https://www.learn-japanese-adventure.com/learn-how-to-speak-japanese.html) (CC BY 4.0), pitch and loudness normalised with `scripts/normalize-audio.py`
