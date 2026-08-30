// Preferences that outlive a run: theme, sound, zoom.

export type Theme = "system" | "light" | "dark";

export type Prefs = {
  effects: boolean;
  theme: Theme;
  // high contrast overrides the theme
  contrast: boolean;
  // root font scale, which scales the whole app
  zoom: number;
};

export const defaultPrefs: Prefs = {
  effects: true,
  theme: "system",
  contrast: false,
  zoom: 1
};

export const zoomMin = 0.7;
export const zoomMax = 1.2;
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

// The three screens the tabs, the swipe and the shortcut move between.
export const tabRoutes = ["setup", "reports", "chart"] as const;

export type TabRoute = (typeof tabRoutes)[number];

// The tab a given number of steps away, wrapping, or null when off the tabs.
export function nextTab(route: string, step: number): TabRoute | null {
  const index = tabRoutes.indexOf(route as TabRoute);
  if (index === -1) return null;
  const length = tabRoutes.length;
  return tabRoutes[(((index + step) % length) + length) % length];
}
