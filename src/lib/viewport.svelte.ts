/**
 * Where the layout has room to spread out. The pull down bars exist because a
 * phone is narrow, so anything from the sm breakpoint up gets the flat layout.
 */

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
