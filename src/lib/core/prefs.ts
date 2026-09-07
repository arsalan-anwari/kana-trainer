// Preferences that outlive a run: theme, sound, zoom.

import { clampZoom, type Theme } from "kaizen-ui";

export { clampZoom, zoomMax, zoomMin, zoomStep, type Theme } from "kaizen-ui";

export type Prefs = {
  effects: boolean;
  // BCP-47 tag, or "auto" to follow the system
  lang: string;
  theme: Theme;
  // high contrast overrides the theme
  contrast: boolean;
  // root font scale, which scales the whole app
  zoom: number;
};

export const defaultPrefs: Prefs = {
  effects: true,
  lang: "auto",
  theme: "system",
  contrast: false,
  zoom: 1
};

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
