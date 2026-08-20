import { describe, expect, it } from "vitest";
import { scoreTier, tierEmoji, tierHeadline } from "../src/lib/core/score";

describe("score tiers", () => {
  it("calls a clean run perfect rather than nearly perfect", () => {
    expect(scoreTier(1, 20)).toBe("perfect");
    expect(tierHeadline(scoreTier(1, 20))).toBe("Perfect");
  });

  it("keeps nearly perfect for the runs that miss one", () => {
    expect(scoreTier(19 / 20, 20)).toBe("great");
    expect(tierHeadline(scoreTier(19 / 20, 20))).toBe("Nearly perfect");
  });

  it("grades the rest by how much landed", () => {
    expect(scoreTier(0.8, 20)).toBe("good");
    expect(scoreTier(0.6, 20)).toBe("fair");
    expect(scoreTier(0.2, 20)).toBe("poor");
  });

  it("does not call an empty run perfect", () => {
    expect(scoreTier(0, 0)).toBe("poor");
  });

  it("has an emoji for every grade", () => {
    for (const accuracy of [1, 0.92, 0.8, 0.6, 0.1]) {
      expect(tierEmoji(scoreTier(accuracy, 10))).not.toBe("");
    }
  });
});
