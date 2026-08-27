/** Preferences that outlive a run: theme, sound, zoom. Kept apart from the
    run settings so the popup menu and the header can share one shape. */

export type Theme = "system" | "light" | "dark";

export type Prefs = {
  effects: boolean;
  theme: Theme;
  /** High contrast overrides the theme, so the theme switch goes dead. */
  contrast: boolean;
  /** Root font scale. Everything is sized in rem, so this scales the app. */
  zoom: number;
};

export const defaultPrefs: Prefs = {
  effects: true,
  theme: "system",
  contrast: false,
  zoom: 1
};

export const zoomMin = 0.7;
export const zoomMax = 1.4;
export const zoomStep = 0.05;

export function clampZoom(value: number): number {
  if (!Number.isFinite(value)) return 1;
  const stepped = Math.round(value / zoomStep) * zoomStep;
  return Math.min(zoomMax, Math.max(zoomMin, Number(stepped.toFixed(2))));
}

export function mergePrefs(stored: Partial<Prefs> | null): Prefs {
  const merged = { ...defaultPrefs, ...(stored ?? {}) };
  return { ...merged, zoom: clampZoom(merged.zoom) };
}

/** The three screens the tabs, the swipe and the shortcut move between. */
export const tabRoutes = ["setup", "reports", "chart"] as const;

export type TabRoute = (typeof tabRoutes)[number];

/**
 * The tab `step` places away from `route`, wrapping at both ends. Null when
 * the current screen is not a tab, so a run is never swiped out from under.
 */
export function nextTab(route: string, step: number): TabRoute | null {
  const index = tabRoutes.indexOf(route as TabRoute);
  if (index === -1) return null;
  const length = tabRoutes.length;
  return tabRoutes[(((index + step) % length) + length) % length];
}
