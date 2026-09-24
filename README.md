# kana-trainer

[![crates.io](https://img.shields.io/crates/v/kana-trainer.svg?style=flat-square)](https://crates.io/crates/kana-trainer)
[![GitHub Downloads](https://img.shields.io/github/downloads/arsalan-anwari/kana-trainer/total?style=flat-square)](https://github.com/arsalan-anwari/kana-trainer/releases)
[![Crates Downloads](https://img.shields.io/crates/d/kana-trainer.svg?style=flat-square)](https://crates.io/crates/kana-trainer)
[![CI](https://github.com/arsalan-anwari/kana-trainer/actions/workflows/ci.yml/badge.svg)](https://github.com/arsalan-anwari/kana-trainer/actions/workflows/ci.yml)
[![license](https://img.shields.io/crates/l/kana-trainer.svg?style=flat-square)](LICENSE)
[![Download Page](https://img.shields.io/badge/Download%20Page-1a1b27?style=flat-square&logo=readthedocs&logoColor=white&labelColor=0d1117)](https://arsalan-anwari.github.io/kana-trainer/)

Trainer for the hiragana and katakana alphabets, on desktop, tablet and phone.
Built with Tauri 2 and Svelte 5, in cream paper and black ink.

See the [roadmap](ROADMAP.md) for planned features and improvements.

<table>
  <tr>
    <td align="center" valign="bottom">
      <img src="packaging/repo/showcase.gif" width="420"
           alt="Kana Trainer on a desktop window, walking through the practice setup, the three question formats, a character set per alphabet, the run length and difficulty, a run stopped and a run scored, the reports screen and the character chart">
    </td>
    <td align="center" valign="bottom">
      <img src="packaging/repo/showcase-phone.gif" width="160"
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

- Hiragana, katakana or both, in either direction, from single characters up to all 147 including the dakuon, handakuon and yoon rows, plus the katakana only tokushon
- Three question formats (text to text, audio to text, text to audio) and answers by multiple choice or typing
- Runs of 10 to 500 questions or one pass over the set, at three difficulty levels that decide how look alike the wrong answers are
- Optional time trial, per question and for the whole run.
- Chart view of every character grouped by sound type and row, tap a tile to hear it
- Score reports saved on disk, exported and imported as `.kt-report` files holding any number of runs. Easy migration of runs to other devices. 
- Responsive interface, the same app on a wide screen and on a phone
- Localization for 17 languages: Arabic, Dutch, English, Farsi, French, German, Hebrew, Indonesian, Korean, Portuguese (Brazilian), Russian, Spanish, Thai, Turkish, Vietnamese, and Chinese (simplified and traditional).
- Support for WCAG 2.2 AA accessibility, including high contrast mode, screen reader support and keyboard navigation.
- Works on Linux, Windows, MacOS and Android.

## Installing

<table>
  <tr>
    <td align="center"><a href=""><img src="https://img.shields.io/badge/Get%20it%20on-Google%20Play-1a1b27?style=for-the-badge&labelColor=0d1117&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgY29sb3I9IiNmZmYiPjxwYXRoIGQ9Ik0zLjYgMS44IDEzLjggMTIgMy42IDIyLjJhMS42IDEuNiAwIDAgMS0uNi0xLjNWMy4xYzAtLjUuMi0xIC42LTEuM3ptMTEuMyAxMS4zIDIuNiAyLjYtMTEuOSA2Ljh6bTAtMi4yTDUuNiAxLjVsMTEuOSA2Ljh6TTE4LjggOWwzIDEuN2ExLjUgMS41IDAgMCAxIDAgMi42bC0zIDEuNy0yLjgtM3oiLz48L3N2Zz4%3D" alt="Get it on Google Play"></a></td>
    <td align="center"><a href=""><img src="https://img.shields.io/badge/Get%20it%20on-F--Droid-1a1b27?style=for-the-badge&labelColor=0d1117&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgY29sb3I9IiNmZmYiPjxwYXRoIGQ9Ik01LjUgMS41IDcuNSA1bTExLTMuNS0yIDMuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01IDVoMTRhMyAzIDAgMCAxIDMgM3YxMWEzIDMgMCAwIDEtMyAzSDVhMyAzIDAgMCAxLTMtM1Y4YTMgMyAwIDAgMSAzLTN6bTcgMy41YTUgNSAwIDEgMCAwIDEwIDUgNSAwIDAgMCAwLTEwem0wIDJhMyAzIDAgMSAxIDAgNiAzIDMgMCAwIDEgMC02eiIvPjwvc3ZnPg%3D%3D" alt="Get it on F-Droid"></a></td>
    <td align="center"><a href=""><img src="https://img.shields.io/badge/Get%20it%20from-Microsoft%20Store-1a1b27?style=for-the-badge&labelColor=0d1117&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgY29sb3I9IiNmZmYiPjxwYXRoIGQ9Ik0zLjQgNy42aDE3LjJsLTEuMiAxMi42YTIgMiAwIDAgMS0yIDEuOEg2LjZhMiAyIDAgMCAxLTItMS44eiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS42Ii8%2BPHBhdGggZD0iTTguMiA3LjZWNS40YTMuOCAzLjggMCAwIDEgNy42IDB2Mi4yIiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48cGF0aCBkPSJNOS4xIDExLjZoMi42djIuNkg5LjF6bTMuMiAwaDIuNnYyLjZoLTIuNnptLTMuMiAzLjJoMi42djIuNkg5LjF6bTMuMiAwaDIuNnYyLjZoLTIuNnoiLz48L3N2Zz4%3D" alt="Get it from Microsoft Store"></a></td>
  </tr>
  <tr>
    <td align="center"><a href=""><img src="https://img.shields.io/badge/Download%20for-Arch%20Linux-1a1b27?style=for-the-badge&labelColor=0d1117&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgY29sb3I9IiNmZmYiPjxwYXRoIGQ9Ik0xMiAuOGMuOCAxLjYgMS4zIDIuNyAyLjIgNC4zLS42LS42LTEuMi0xLTEuOC0xLjQuOSAyLjMgMS40IDQuNyAxLjIgNy4xLS4xIDIuNi0xLjEgNS0yLjcgNyAxLjYtLjQgMy4yLTEuMyA0LjQtMi41LS4xLjctLjQgMS40LS45IDIuMSAyLjEtMS40IDMuMi0zLjQgMy40LTUuNGw0LjYgMTAuMkgxLjZMMTIgLjh6bS4zIDE1LjRjMSAuNiAxLjkgMS40IDIuNSAyLjRIOS4yYy42LTEgMS41LTEuOCAyLjUtMi40eiIvPjwvc3ZnPg%3D%3D" alt="Download for Arch Linux"></a></td>
    <td align="center"><a href=""><img src="https://img.shields.io/badge/Download%20for-Fedora-1a1b27?style=for-the-badge&labelColor=0d1117&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgY29sb3I9IiNmZmYiPjxwYXRoIGQ9Ik0xMiAwYTEyIDEyIDAgMCAwIDAgMjRoNS43YTYuMyA2LjMgMCAwIDAgNi4zLTYuM1YxMkExMiAxMiAwIDAgMCAxMiAwem0xLjYgNS42YTMuNiAzLjYgMCAwIDEgMy42IDMuNiAxLjIgMS4yIDAgMSAxLTIuNCAwIDEuMiAxLjIgMCAwIDAtMS4yLTEuMiAxLjIgMS4yIDAgMCAwLTEuMiAxLjJ2Mi4yaDJhMS4yIDEuMiAwIDEgMSAwIDIuNGgtMnYxLjRhMy42IDMuNiAwIDEgMS0zLjYtMy42aDEuMlY5LjJhMy42IDMuNiAwIDAgMSAzLjYtMy42ek05LjIgMTMuNmExLjIgMS4yIDAgMSAwIDEuMiAxLjJ2LTEuMnoiLz48L3N2Zz4%3D" alt="Download for Fedora"></a></td>
    <td align="center"><a href=""><img src="https://img.shields.io/badge/Download%20for-Ubuntu%20%2F%20Debian-1a1b27?style=for-the-badge&labelColor=0d1117&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgY29sb3I9IiNmZmYiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjUuMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMy4yIiByPSIyLjYiLz48Y2lyY2xlIGN4PSI0LjQiIGN5PSIxNi40IiByPSIyLjYiLz48Y2lyY2xlIGN4PSIxOS42IiBjeT0iMTYuNCIgcj0iMi42Ii8%2BPC9zdmc%2B" alt="Download for Ubuntu / Debian"></a></td>
  </tr>
  <tr>
    <td align="center"><a href=""><img src="https://img.shields.io/badge/Download%20for-macOS-1a1b27?style=for-the-badge&labelColor=0d1117&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgY29sb3I9IiNmZmYiPjxwYXRoIGQ9Ik0xNi40IDEyLjdjMC0yLjcgMi4yLTQgMi4zLTQuMS0xLjItMS44LTMuMi0yLTMuOS0yLjEtMS42LS4yLTMuMi45LTQgLjlzLTIuMS0uOS0zLjUtLjljLTEuOCAwLTMuNCAxLTQuMyAyLjYtMS45IDMuMi0uNSA4IDEuMyAxMC42LjkgMS4zIDEuOSAyLjcgMy4zIDIuNiAxLjMtLjEgMS44LS44IDMuNC0uOHMyIC44IDMuNC44IDIuMy0xLjMgMy4yLTIuNWMxLTEuNSAxLjQtMi45IDEuNC0zLS4xIDAtMi43LTEtMi43LTQuMXpNMTMuOCA0LjNjLjctLjkgMS4yLTIuMSAxLjEtMy4zLTEgMC0yLjMuNy0zLjEgMS42LS43LjgtMS4zIDItMS4xIDMuMiAxLjEuMSAyLjMtLjYgMy4xLTEuNXoiLz48L3N2Zz4%3D" alt="Download for macOS"></a></td>
    <td align="center"><a href=""><img src="https://img.shields.io/badge/Download%20for-Windows-1a1b27?style=for-the-badge&labelColor=0d1117&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgY29sb3I9IiNmZmYiPjxwYXRoIGQ9Ik0wIDMuNCA5LjggMnY5LjRIMHptMTAuOS0xLjZMMjQgMHYxMS40SDEwLjl6TTAgMTIuNmg5LjhWMjJMMCAyMC42em0xMC45IDBIMjRWMjRsLTEzLjEtMS44eiIvPjwvc3ZnPg%3D%3D" alt="Download for Windows"></a></td>
    <td align="center"><a href=""><img src="https://img.shields.io/badge/Download%20the-Android%20APK-1a1b27?style=for-the-badge&labelColor=0d1117&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgY29sb3I9IiNmZmYiPjxwYXRoIGQ9Ik02IDl2Ny41YzAgLjYuNCAxIDEgMWgxVjIxYTEuNSAxLjUgMCAwIDAgMyAwdi0zLjVoMlYyMWExLjUgMS41IDAgMCAwIDMgMHYtMy41aDFjLjYgMCAxLS40IDEtMVY5SDZ6TTQgOWExLjUgMS41IDAgMCAwLTEuNSAxLjV2NWExLjUgMS41IDAgMCAwIDMgMHYtNUExLjUgMS41IDAgMCAwIDQgOXptMTYgMGExLjUgMS41IDAgMCAwLTEuNSAxLjV2NWExLjUgMS41IDAgMCAwIDMgMHYtNUExLjUgMS41IDAgMCAwIDIwIDl6TTE1LjkgMi43bDEuMS0xLjlhLjMuMyAwIDAgMC0uNS0uM2wtMS4xIDJBNi43IDYuNyAwIDAgMCAxMiAyYy0uOSAwLTEuNy4yLTIuNC41TDguNS41YS4zLjMgMCAwIDAtLjUuM2wxLjEgMS45QTUuNiA1LjYgMCAwIDAgNiA3LjVoMTJhNS42IDUuNiAwIDAgMC0yLjEtNC44ek05LjUgNS40YS42LjYgMCAxIDEgMC0xLjIuNi42IDAgMCAxIDAgMS4yem01IDBhLjYuNiAwIDEgMSAwLTEuMi42LjYgMCAwIDEgMCAxLjJ6Ii8%2BPC9zdmc%2B" alt="Download the Android APK"></a></td>
  </tr>
</table>

### Manually

[https://arsalan-anwari.github.io/kana-trainer/](https://arsalan-anwari.github.io/kana-trainer/)

```sh
sudo dnf install ./kana-trainer-*.rpm            # fedora, opensuse
sudo apt install ./kana-trainer_*.deb            # debian 13+, ubuntu 24.04+
sudo pacman -U ./kana-trainer-*.pkg.tar.zst      # arch
```

Or run apk/exe/dmg package with your OS package installer. 

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
git submodule update --init   # vendor/kaizen-ui, the UI kit
npm ci
npm run tauri:dev      # run the app against the vite dev server
npm run tauri:build    # bundle for the current platform
npm test               # unit tests
npm run test:e2e       # playwright
```

## Keyboard Shortcuts

Desktop only. Press `Ctrl+/` to start keyboard mode and `Ctrl+Shift+/` to stop
it; outside the mode these shortcuts do nothing. A badge in the top left shows when
the mode is on. Press `?` anywhere for a list of shortcuts.

`Shift+up` and `Shift+down` walk between sections; the current section is
outlined in blue.  `Tab` and `Shift+Tab` navigation only works in the active section.

### Menus and pages

| Key | Does |
| --- | --- |
| `Ctrl+/` | Start keyboard mode |
| `Ctrl+Shift+/` | Stop keyboard mode |
| `Shift+up` / `Shift+down` | Move between sections |
| `Tab` / `Shift+Tab` | Next or previous element in the section |
| `up` / `down` | First or last element in the section |
| `Ctrl+up` / `Ctrl+down` | Scroll the page |
| `Space` | Select what is focused |
| `Enter` | Confirm what is focused |
| `Ctrl+left` / `Ctrl+right` | Switch between Practice, Reports and Chart |
| `Escape` | Close a dialog, sheet or picker |
| `?` | Show the shortcut list |

### During a run

| Key | Does |
| --- | --- |
| `1` to `4` | Pick an answer in multiple choice |
| `Enter` | Submit a typed answer or a picked sound, then move on |
| `r` | Replay the sound in audio questions |
| `Escape` | Leave the run |

## Credits

- Character sounds from [FUN Japanese Learning](https://funjapaneselearning.com) (CC BY 4.0). Upload available on [Hugging Face](https://huggingface.co/datasets/arsalan-anwari/kana-sounds).
