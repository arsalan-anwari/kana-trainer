
import { clampZoom, type Theme } from "kaizen-ui";

export { clampZoom, zoomMax, zoomMin, zoomStep, type Theme } from "kaizen-ui";

export type Prefs = {
  effects: boolean;
  lang: string;
  theme: Theme;
  contrast: boolean;
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

export const tabRoutes = ["setup", "reports", "chart"] as const;

export type TabRoute = (typeof tabRoutes)[number];

export function nextTab(route: string, step: number): TabRoute | null {
  const index = tabRoutes.indexOf(route as TabRoute);
  if (index === -1) return null;
  const length = tabRoutes.length;
  return tabRoutes[(((index + step) % length) + length) % length];
}
