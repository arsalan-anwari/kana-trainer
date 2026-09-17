import { describe, expect, it } from "vitest";
import {
  clampZoom,
  defaultPrefs,
  mergePrefs,
  zoomMax,
  zoomMin
} from "../src/lib/core/prefs";

describe("zoom", () => {
  it("stays inside the range and snaps to a step", () => {
    expect(clampZoom(0.1)).toBe(zoomMin);
    expect(clampZoom(9)).toBe(zoomMax);
    expect(clampZoom(1.02)).toBe(1);
    expect(clampZoom(Number.NaN)).toBe(1);
  });
});

describe("prefs from storage", () => {
  it("fills in keys older versions never wrote", () => {
    expect(mergePrefs({ effects: false, theme: "dark" })).toEqual({
      ...defaultPrefs,
      effects: false,
      theme: "dark"
    });
    expect(mergePrefs(null)).toEqual(defaultPrefs);
    expect(mergePrefs({ zoom: 99 }).zoom).toBe(zoomMax);
  });
});
