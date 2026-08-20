/** How a finished run is graded, shared by the splash, the headline and the sound. */

export const scoreTiers = ["perfect", "great", "good", "fair", "poor"] as const;

export type ScoreTier = (typeof scoreTiers)[number];

export function scoreTier(accuracy: number, total = 1): ScoreTier {
  if (total === 0) return "poor";
  if (accuracy >= 1) return "perfect";
  if (accuracy >= 0.9) return "great";
  if (accuracy >= 0.75) return "good";
  if (accuracy >= 0.5) return "fair";
  return "poor";
}

const headlines: Record<ScoreTier, string> = {
  perfect: "Perfect",
  great: "Nearly perfect",
  good: "Strong run",
  fair: "Getting there",
  poor: "Keep practicing"
};

const emoji: Record<ScoreTier, string> = {
  perfect: "🏆",
  great: "🎉",
  good: "👏",
  fair: "💪",
  poor: "📚"
};

const blurbs: Record<ScoreTier, string> = {
  perfect: "Not a single one missed.",
  great: "So close to a clean sheet.",
  good: "Most of them landed.",
  fair: "The shape of it is there.",
  poor: "Every run makes the next one easier."
};

export function tierHeadline(tier: ScoreTier): string {
  return headlines[tier];
}

export function tierEmoji(tier: ScoreTier): string {
  return emoji[tier];
}

export function tierBlurb(tier: ScoreTier): string {
  return blurbs[tier];
}
