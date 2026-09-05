// Grading of a finished run.

import { t } from "../i18n.svelte";

export const scoreTiers = ["perfect", "great", "good", "fair", "poor"] as const;

export type ScoreTier = (typeof scoreTiers)[number];

const emoji: Record<ScoreTier, string> = {
  perfect: "🏆",
  great: "🎉",
  good: "👏",
  fair: "💪",
  poor: "📚"
};

export function scoreTier(accuracy: number, total = 1): ScoreTier {
  if (total === 0) return "poor";
  if (accuracy >= 1) return "perfect";
  if (accuracy >= 0.9) return "great";
  if (accuracy >= 0.75) return "good";
  if (accuracy >= 0.5) return "fair";
  return "poor";
}

export function tierHeadline(tier: ScoreTier): string {
  return t(`result.tier.${tier}`);
}

export function tierEmoji(tier: ScoreTier): string {
  return emoji[tier];
}

export function tierBlurb(tier: ScoreTier): string {
  return t(`result.blurb.${tier}`);
}
