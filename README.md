# kana-trainer

[![crates.io](https://img.shields.io/crates/v/kana-trainer.svg?style=flat-square)](https://crates.io/crates/kana-trainer)
[![GitHub Downloads](https://img.shields.io/github/downloads/arsalan-anwari/kana-trainer/total?style=flat-square)](https://github.com/arsalan-anwari/kana-trainer/releases)
[![Crates Downloads](https://img.shields.io/crates/d/kana-trainer.svg?style=flat-square)](https://crates.io/crates/kana-trainer)
[![CI](https://github.com/arsalan-anwari/kana-trainer/actions/workflows/ci.yml/badge.svg)](https://github.com/arsalan-anwari/kana-trainer/actions/workflows/ci.yml)
[![license](https://img.shields.io/crates/l/kana-trainer.svg?style=flat-square)](LICENSE)
[![Docs](https://img.shields.io/badge/Docs-1a1b27?style=flat-square&logo=readthedocs&logoColor=white&labelColor=0d1117)](https://arsalan-anwari.github.io/kana-trainer/)
[![Microsoft Store](https://img.shields.io/badge/Microsoft%20Store-1a1b27?style=flat-square&labelColor=0d1117&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI%2BPHBhdGggZD0iTTMuNCA3LjZoMTcuMmwtMS4yIDEyLjZhMiAyIDAgMCAxLTIgMS44SDYuNmEyIDIgMCAwIDEtMi0xLjh6IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS42Ii8%2BPHBhdGggZD0iTTguMiA3LjZWNS40YTMuOCAzLjggMCAwIDEgNy42IDB2Mi4yIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS42Ii8%2BPHBhdGggZD0iTTkuMSAxMS42aDIuNnYyLjZIOS4xem0zLjIgMGgyLjZ2Mi42aC0yLjZ6bS0zLjIgMy4yaDIuNnYyLjZIOS4xem0zLjIgMGgyLjZ2Mi42aC0yLjZ6IiBmaWxsPSIjZmZmIi8%2BPC9zdmc%2B)](https://apps.microsoft.com/detail/9pbn4s73d1qc)

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
- Optional time trial, per question and for the whole run.
- Chart view of every character grouped by sound type and row, tap a tile to hear it
- Score reports saved on disk, exported and imported as `.kt-report` files holding any number of runs. Easy migration of runs to other devices. 
- Responsive interface, the same app on a wide screen and on a phone
- Works on Linux, Windows, MacOS and Android.

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


## Development

Needs Node 22+ and Rust 1.77+, plus the GTK and WebKit development headers.

```sh
# fedora
sudo dnf install webkit2gtk4.1-devel gtk3-devel glib2-devel librsvg2-devel \
                 libsoup3-devel openssl-devel dbus-devel patchelf \
                 libappstream-glib rpm-build dpkg

# debian, ubuntu
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libglib2.0-dev librsvg2-dev \
                 libsoup-3.0-dev libssl-dev libdbus-1-dev patchelf \
                 build-essential curl wget file rpm

# arch
sudo pacman -S webkit2gtk-4.1 gtk3 glib2 librsvg libsoup3 openssl dbus \
               patchelf base-devel rpm-tools
```

`rpm-build`/`rpm`/`rpm-tools` and `dpkg` are only needed for the `.rpm` and
`.deb` bundle targets, `patchelf` for bundling in general. On Arch `dpkg` comes
from the AUR.

```sh
npm ci
npm run tauri:dev      # run the app against the vite dev server
npm run tauri:build    # bundle for the current platform
npm test               # unit tests
npm run test:e2e       # playwright
```

## Keyboard Shortcuts

- `1` to `4` picks an answer in multiple choice
- `Enter` submits a typed answer, submits the picked sound in text to audio, and
  moves on after feedback
- `r` replays the sound in audio questions
- `Escape` leaves the run
- `Shift+left` and `Shift+right` move between pages.

## Credits

- Character sounds from [Learn Japanese Adventure](https://www.learn-japanese-adventure.com/learn-how-to-speak-japanese.html) (CC BY 4.0), pitch and loudness normalised with `scripts/normalize-audio.py`. Upload available on [Hugging Face](https://huggingface.co/datasets/arsalan-anwari/kana-sounds).
