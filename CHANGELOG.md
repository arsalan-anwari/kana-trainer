# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-19

### Added

- Windows, macOS and Android packages: the release workflow now builds deb, rpm, Arch, an `.exe` installer, a universal `.dmg` and an `.apk`
- A `build-pkg-*` tag builds a chosen subset of those packages as workflow
  artifacts.
- A playwright smoke test covering that the app opens, a run starts and a character sound really plays, run on every release and in ci.

### Changed

- Responsive layout for desktop, tablet and phone. 
- New design for the app to make it more modern
- New app icons and optimized icons for android sdk <25
- Quizes optimized for mobile and touch devices. 
- Assets load through one reusable store that keeps the bytes and hands out blob URLs.
- Screens are split into small components under `src/lib/components/<screen>/`

### Removed

- The build, package, container, dev and test shell scripts as `scripts/publish.sh` publishes to crates.io and the github workflows do everything else.
- Flatpack and appimage as a build and release target. Native binaries already cover all major distros. An extra target stalls the ci too much. Appimage is bugged on tauri with wayland, waiting for fix (see: https://github.com/readest/readest/issues/190). 

## [1.0.1] - 2026-08-18

### Fixed

- Kana audio not playing on Linux release builds: WebKitGTK's media backend cannot
  stream from the `tauri://` custom protocol, so `<audio src="...">` silently failed
  there even though the same URL worked with `fetch()`. Sounds are now fetched and
  played back as blobs instead.

## [1.0.0] - 2026-08-18

First stable release.

### Added

- Practice hiragana, katakana or both, in either direction: kana to romaji, romaji to kana or mixed
- Three question formats: text to text, audio to text and text to audio, with 46 recorded character sounds
- Two answer styles: multiple choice with four options, or typing the romaji yourself
- Time trial with 5, 10, 15 or 30 seconds per question and an optional limit for the whole run
- Character selection by single character, whole row, or the characters you keep getting wrong
- Optional dakuten and handakuten rows, text to text only for now
- Score reports saved on disk, loaded and exported as JSON files
- Charts for the characters, rows and alphabets you struggle with
- One click to turn past mistakes into a new practice set
- Keyboard controls: `1` to `4` to answer, `Enter` to submit, `r` to replay a sound, `Escape` to leave a run
- Linux packaging for deb, rpm, AppImage, Arch and Flatpak

[1.1.0]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.1.0
[1.0.1]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.0.1
[1.0.0]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.0.0
