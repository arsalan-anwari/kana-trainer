// One colour ramp shared by every report visual: red at nothing right, green at
// everything right, mixed in oklab so the middle stays readable in both themes.
// Every caller pairs the colour with a number, colour alone never carries the
// value.

export function heatColor(accuracy: number): string {
  const share = Math.round(Math.min(1, Math.max(0, accuracy)) * 100);
  return `color-mix(in oklab, var(--color-success) ${share}%, var(--color-danger))`;
}

// The same ramp laid over a surface, faint enough to read text on.
export function heatFill(accuracy: number, strength = 18): string {
  return `color-mix(in oklab, ${heatColor(accuracy)} ${strength}%, var(--color-surface))`;
}
