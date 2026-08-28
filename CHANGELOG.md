# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.1] - 2026-08-28

### Fixed

- Selected boxes on the practice, reports and chart screens were almost invisible in high contrast. They now use the gold accent from the buttons instead of a faint fade.
- Linter errors and warnings in the scripts and tools, and a few unused files, removed.

### Changed

- The content and packaging scripts are now five: `test_ci.sh`, `publish.sh`, `record.sh`, `update_version.sh` and `upload_data.sh`. Each takes flags for what to do, plus `--all`.
- `scripts/` holds only bash. The Python, TypeScript and HTML it calls moved to `tools/`.
- The screenshots, gifs, promo clip and download page moved from `docs/` to `packaging/repo/`.
- The promo thumbnail is generated from the first light theme home screen still.
- The Microsoft Store demo shots and the download page assets are symlinks to `packaging/repo/` rather than second copies.

### Removed

- `record-showcase.sh`, `record-promo.sh`, `build-download-page.sh`, `publish-docs.sh`, `publish-crates-io.sh` and `android-icons.sh`, folded into `record.sh` and `publish.sh`.

## [1.6.0] - 2026-08-27

### Added

- A high contrast theme, a fixed black and white palette with a gold accent.
- Zoom, in steps between 70% and 140%, with the current level shown as a percentage.
- Switching tabs by swiping left and right on a touch screen, and with `Shift` + `Left`/`Right` on a keyboard. Swipes are ignored while a dialog is open or a run is in progress.
- A full screen settings sheet on phones, opened from the button beside the app name. Theme, high contrast, zoom and sound effects moved there.
- Sound effects can be turned on and off from the header on desktop and tablet, next to the theme button or in settings screen on mobile.
- Different celebration animations and sfx depending the score.

### Changed

- Phones now show the character picker and the character chart as rows that pull down. Desktop and tablet keep the flat layout they had.
- Row labels follow structure `{n}-row` rather than `{n}A` for characters.
- The chart blocks are shorter on a phone and carry a larger reading.
- The answer style and alphabet pickers sit two across on a phone rather than stacked.
- The quiz fits on a phone screen without scrolling.
- The audio question frame takes a share of the screen height on a phone rather than a fixed small square, and what is inside it scales with the frame instead of spilling out of the tap target.
- The app leaves room for the notification bar and the home indicator, so the logo is no longer behind the status bar.
- "Settings" on the practice screen is now "Run options", and it holds the dakuon, handakuon and yoon toggles.

### Removed

- The "Extras" card on the practice screen. Its three toggles moved into "Run options".
- The reports toolbar drops the "n shown" count on a phone, which was squeezing the icons next to it.

## [1.5.5] - 2026-08-25

### Changed

- The Wayland/Nvidia startup fix now comes from the [`tauri-plugin-wayland-nvidia-quirk`](https://crates.io/crates/tauri-plugin-wayland-nvidia-quirk) crate instead of a module in this repository. The behaviour is the same, and the plugin also covers windows opened after startup. `TAURI_WAYLAND_NVIDIA_QUIRK=0` now turns it off and `TAURI_WAYLAND_NVIDIA_QUIRK_VERBOSE=1` logs what it decided; `WEBKIT_DISABLE_DMABUF_RENDERER=1` still stands the fix down and takes WebKit off the GPU path.

## [1.5.4] - 2026-08-24

### Changed

- The Wayland/Nvidia startup failure ("Gdk-Message: Error 71") is now fixed without giving up hardware acceleration. Instead of disabling WebKitGTK's DMA-BUF renderer, the app creates a GL context on its window before the first frame, which makes GTK3 run every frame on GL and never attach the shared-memory buffer that the compositor rejects (see [tauri-apps/tauri#10702](https://github.com/tauri-apps/tauri/issues/10702)). Setting `WEBKIT_DISABLE_DMABUF_RENDERER=1` still forces the old workaround.

### Added

- A troubleshooting guide for the Wayland/Nvidia startup failure, and for the cosmetic WebKitGTK crash on KDE Plasma after closing the window.

## [1.5.3] - 2026-08-23

### Fixed

- The 1.5.2 workaround for the Wayland/Nvidia startup failure ("Gdk-Message: Error 71") disabling WebKitGTK's DMA-BUF renderer on every Linux system, which gave up the GPU path for Intel and AMD users who never had the bug. It is now only disabled when the session is Wayland (`WAYLAND_DISPLAY`, `WAYLAND_SOCKET` or `XDG_SESSION_TYPE`, so launches without a session environment are still covered) and the Nvidia kernel driver is loaded (see [tauri-apps/tauri#10702](https://github.com/tauri-apps/tauri/issues/10702)). `WEBKIT_DISABLE_DMABUF_RENDERER` still overrides the detection either way.

## [1.5.2] - 2026-08-23

### Fixed

- The app failing to start on Wayland with Nvidia's proprietary driver ("Gdk-Message: Error 71 (Protocol error) dispatching to Wayland display"). WebKitGTK's DMA-BUF renderer is now disabled on Linux; set `WEBKIT_DISABLE_DMABUF_RENDERER=0` to keep the GPU path.

### Added
- Package install steps for Linux for development instructions.
- Added troubleshooting guide. 

## [1.5.1] - 2026-08-21

### Fixed

- Exporting and importing on android, which left a zero byte file behind: the file dialogs there hand back a `content://` URI rather than a path, so the write went through the fs plugin instead of the filesystem directly.
- A failed export now says so instead of passing in silence.

## [1.5.0] - 2026-08-21

### Changed

- Reports are exported and imported as `.kt-report` files, one file holding any number of runs instead of one JSON file per run.
- Export moved next to import in the reports toolbar and works on the selection.
- Deleting asks in a dialog instead of arming the trash icon for a second click.

### Removed

- The per run Save and Delete buttons in the reports list. Ticking runs and using the toolbar covers both.
- Loading a single run from a JSON file. Older exported JSON reports cannot be imported.

## [1.4.0] - 2026-08-21

### Added

- A remove all button in the reports list, next to select all and clear.
- Improved audio samples with better alternatives and normalized and cropped samples to be shorter. 

## [1.3.0] - 2026-08-20

### Fixed

- A run with every answer right said "Nearly perfect". It now says "Perfect", with the grades in between rebalanced around it.
- Quitting a run part way through scored and saved it. A run only counts once finished; stopping one, or leaving the quiz screen through the header, now throws it away.
- Multiple choice could offer two options meaning the same thing, marking a right answer wrong. Options are now compared on what they show or play, not on their id.
- The android apk was signed with a freshly generated key on every release, so Android refused to install one over another and only a clean install worked. Releases now carry a fixed signing key. Uninstall any earlier apk once before installing this one; updates work normally from here.

### Added

- A confirmation before a run is stopped, with the clock held while it is up.
- A splash over the finished run: an emoji for the grade and confetti for the good ones. Tap or wait to reach the report.
- More question counts, a custom count from 10 to 500, and one pass.
- A difficulty under Settings, deciding how many wrong answers are deliberate look alikes.
- A separate character set per alphabet, as a tab each when hiragana and katakana are both on.
- Reports filter by today, yesterday, last week or last month, with icon buttons to select all, clear and load.
- A Mistakes by group panel under the reports charts, filing every miss by set and row.

### Changed

- The Time trial block is now called Settings, since it holds more than timing.
- The theme switcher is an icon button pinned to the right of the header.
- Removed the navigation buttons from the chart, reports and character picker screens, which the header already covers.

## [1.2.0] - 2026-08-20

### Fixed
- Audio freezes and sound effects. 
- Muffeled sound effects and general app freezed when switches tabs. 

### Added

- Dakuon, handakuon and yoon characters, 104 in total. Each is a separate switch under Extras and stays off by default.
- Rows for the yoon characters: きゃ, しゃ, ちゃ, にゃ, ひゃ, みゃ, りゃ, ぎゃ, じゃ, びゃ and ぴゃ.
- A Chart view next to Reports: every character as a square tile with the romaji above the hiragana and katakana, grouped by seion, dakuon, handakuon and yoon and split by row. Tapping a tile plays its sound.
- Splash screen for app startup. 

### Changed

- Character sounds now come from [veardk/just-gojuon](https://github.com/veardk/just-gojuon), which covers every character rather than the 46 basic ones.
- All clips are pitch and loudness normalised to one voice level by `scripts/normalize-audio.py`. The source recordings drift from 149 Hz to 367 Hz and vary 15 dB in level.
- Audio to text and text to audio work with every character set, so switching one on no longer forces text only mode.
- Clips live in `public/audio/<group>/<romaji>.mp3` instead of `public/audio/kana/`.
- A stored `includeDakuten` setting from an older version turns into dakuon plus handakuon on load.

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

[1.6.1]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.6.1
[1.6.0]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.6.0
[1.5.5]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.5.5
[1.5.4]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.5.4
[1.5.3]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.5.3
[1.5.2]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.5.2
[1.5.1]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.5.1
[1.5.0]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.5.0
[1.4.0]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.4.0
[1.3.0]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.3.0
[1.2.0]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.2.0
[1.1.0]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.1.0
[1.0.1]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.0.1
[1.0.0]: https://github.com/arsalan-anwari/kana-trainer/releases/tag/v1.0.0
