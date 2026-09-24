import type { Badge } from "./stage";

/* Glyphs are 24x24 and paint in currentColor. The platform ones match icon()
   in scripts/publish.sh, so the clip and the download page share one set. */
const glyph = {
  play: '<path d="M3.6 1.8 13.8 12 3.6 22.2a1.6 1.6 0 0 1-.6-1.3V3.1c0-.5.2-1 .6-1.3zm11.3 11.3 2.6 2.6-11.9 6.8zm0-2.2L5.6 1.5l11.9 6.8zM18.8 9l3 1.7a1.5 1.5 0 0 1 0 2.6l-3 1.7-2.8-3z"/>',
  fdroid: '<path d="M5.5 1.5 7.5 5m11-3.5-2 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path fill-rule="evenodd" d="M5 5h14a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zm7 3.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>',
  store: '<path d="M3.4 7.6h17.2l-1.2 12.6a2 2 0 0 1-2 1.8H6.6a2 2 0 0 1-2-1.8z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.2 7.6V5.4a3.8 3.8 0 0 1 7.6 0v2.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9.1 11.6h2.6v2.6H9.1zm3.2 0h2.6v2.6h-2.6zm-3.2 3.2h2.6v2.6H9.1zm3.2 0h2.6v2.6h-2.6z"/>',
  arch: '<path d="M12 .8c.8 1.6 1.3 2.7 2.2 4.3-.6-.6-1.2-1-1.8-1.4.9 2.3 1.4 4.7 1.2 7.1-.1 2.6-1.1 5-2.7 7 1.6-.4 3.2-1.3 4.4-2.5-.1.7-.4 1.4-.9 2.1 2.1-1.4 3.2-3.4 3.4-5.4l4.6 10.2H1.6L12 .8zm.3 15.4c1 .6 1.9 1.4 2.5 2.4H9.2c.6-1 1.5-1.8 2.5-2.4z"/>',
  fedora: '<path d="M12 0a12 12 0 0 0 0 24h5.7a6.3 6.3 0 0 0 6.3-6.3V12A12 12 0 0 0 12 0zm1.6 5.6a3.6 3.6 0 0 1 3.6 3.6 1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 0-1.2-1.2 1.2 1.2 0 0 0-1.2 1.2v2.2h2a1.2 1.2 0 1 1 0 2.4h-2v1.4a3.6 3.6 0 1 1-3.6-3.6h1.2V9.2a3.6 3.6 0 0 1 3.6-3.6zM9.2 13.6a1.2 1.2 0 1 0 1.2 1.2v-1.2z"/>',
  debian: '<circle cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="3.2" r="2.6"/><circle cx="4.4" cy="16.4" r="2.6"/><circle cx="19.6" cy="16.4" r="2.6"/>',
  apple: '<path d="M16.4 12.7c0-2.7 2.2-4 2.3-4.1-1.2-1.8-3.2-2-3.9-2.1-1.6-.2-3.2.9-4 .9s-2.1-.9-3.5-.9c-1.8 0-3.4 1-4.3 2.6-1.9 3.2-.5 8 1.3 10.6.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8 2.3-1.3 3.2-2.5c1-1.5 1.4-2.9 1.4-3-.1 0-2.7-1-2.7-4.1zM13.8 4.3c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3.1 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3.1-1.5z"/>',
  windows: '<path d="M0 3.4 9.8 2v9.4H0zm10.9-1.6L24 0v11.4H10.9zM0 12.6h9.8V22L0 20.6zm10.9 0H24V24l-13.1-1.8z"/>',
  android: '<path d="M6 9v7.5c0 .6.4 1 1 1h1V21a1.5 1.5 0 0 0 3 0v-3.5h2V21a1.5 1.5 0 0 0 3 0v-3.5h1c.6 0 1-.4 1-1V9H6zM4 9a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 4 9zm16 0a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 20 9zM15.9 2.7l1.1-1.9a.3.3 0 0 0-.5-.3l-1.1 2A6.7 6.7 0 0 0 12 2c-.9 0-1.7.2-2.4.5L8.5.5a.3.3 0 0 0-.5.3l1.1 1.9A5.6 5.6 0 0 0 6 7.5h12a5.6 5.6 0 0 0-2.1-4.8zM9.5 5.4a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2zm5 0a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2z"/>'
};

/* Read left to right, top to bottom: stores, linux packages, direct downloads. */
export const badges: Badge[] = [
  { icon: glyph.play, over: "Get it on", name: "Google Play" },
  { icon: glyph.fdroid, over: "Get it on", name: "F-Droid" },
  { icon: glyph.store, over: "Get it from", name: "Microsoft Store" },
  { icon: glyph.arch, over: "Download for", name: "Arch Linux" },
  { icon: glyph.fedora, over: "Download for", name: "Fedora" },
  { icon: glyph.debian, over: "Download for", name: "Ubuntu / Debian" },
  { icon: glyph.apple, over: "Download for", name: "macOS" },
  { icon: glyph.windows, over: "Download for", name: "Windows" },
  { icon: glyph.android, over: "Download the", name: "Android APK" }
];
