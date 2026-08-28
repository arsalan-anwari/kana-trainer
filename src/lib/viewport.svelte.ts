// Tracks whether the viewport is wide enough for the flat layout.

const WIDE = "(min-width: 640px)";

class Viewport {
  wide = $state(true);

  constructor() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(WIDE);
    this.wide = query.matches;
    query.addEventListener("change", (event) => (this.wide = event.matches));
  }
}

export const viewport = new Viewport();
