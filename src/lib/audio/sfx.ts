/** Short synthesised interface sounds. No files, no assets, just oscillators. */

import type { ScoreTier } from "../core/score";
import { shared } from "./shared";

let enabled = true;

type Step = [frequency: number, duration: number, type: OscillatorType, volume: number, delay: number];

/**
 * Nodes are scheduled a hair into the future. WebKitGTK mixes audio in fairly
 * large blocks, so a ramp starting inside the block that is already being
 * rendered gets cut off part way, which is what turns a soft blip into a click.
 */
const LEAD_SECONDS = 0.02;

type Bus = {
  context: AudioContext;
  /** Everything meets here, so the destination only ever has one input. */
  master: GainNode;
};

function bus(): Bus | null {
  if (typeof window === "undefined") return null;
  return shared("sfx-bus", () => {
    const context = new AudioContext({ latencyHint: "interactive" });
    const master = context.createGain();
    master.gain.value = 1;
    master.connect(context.destination);
    return { context, master };
  });
}

function tone(target: Bus, step: Step, base: number): void {
  const [frequency, duration, type, volume, delay] = step;
  const start = base + delay;
  const oscillator = target.context.createOscillator();
  const gain = target.context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(target.master);
  // an oscillator that is never unhooked stays in the graph and keeps costing
  // render time, which piles up over a session of clicking
  oscillator.onended = (): void => {
    oscillator.disconnect();
    gain.disconnect();
  };
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function schedule(target: Bus, steps: Step[]): void {
  const base = target.context.currentTime + LEAD_SECONDS;
  for (const step of steps) tone(target, step, base);
}

function play(steps: Step[]): void {
  if (!enabled) return;
  const target = bus();
  if (target === null) return;
  if (target.context.state === "running") {
    schedule(target, steps);
    return;
  }
  // A suspended context has a frozen clock, so work queued against it lands in
  // the past and is either dropped or fired late in one clump. Wait for the
  // resume and schedule against the clock that is really running.
  void target.context
    .resume()
    .then(() => schedule(target, steps))
    .catch(() => undefined);
}

export function setEffectsEnabled(value: boolean): void {
  enabled = value;
}

/**
 * One flourish per grade. A clean run gets the full rising run with a sparkle
 * on top, a poor one gets something short and kind rather than a raspberry.
 */
const fanfares: Record<ScoreTier, Step[]> = {
  perfect: [
    [523, 0.12, "sine", 0.11, 0],
    [659, 0.12, "sine", 0.11, 0.1],
    [784, 0.12, "sine", 0.11, 0.2],
    [1047, 0.16, "sine", 0.12, 0.3],
    [1319, 0.3, "sine", 0.11, 0.44],
    [1568, 0.4, "triangle", 0.07, 0.5],
    [2093, 0.22, "sine", 0.05, 0.66]
  ],
  great: [
    [523, 0.12, "sine", 0.11, 0],
    [784, 0.12, "sine", 0.11, 0.11],
    [1047, 0.16, "sine", 0.11, 0.22],
    [1319, 0.3, "sine", 0.1, 0.36]
  ],
  good: [
    [523, 0.13, "sine", 0.1, 0],
    [659, 0.13, "sine", 0.1, 0.12],
    [880, 0.26, "sine", 0.1, 0.24]
  ],
  fair: [
    [440, 0.14, "sine", 0.09, 0],
    [587, 0.24, "sine", 0.09, 0.13]
  ],
  poor: [
    [392, 0.16, "sine", 0.08, 0],
    [330, 0.28, "sine", 0.07, 0.15]
  ]
};

export const sfx = {
  click: (): void => play([[420, 0.05, "triangle", 0.08, 0]]),
  select: (): void => play([[620, 0.06, "triangle", 0.08, 0]]),
  correct: (): void =>
    play([
      [660, 0.1, "sine", 0.12, 0],
      [880, 0.16, "sine", 0.12, 0.08]
    ]),
  wrong: (): void =>
    play([
      [200, 0.16, "sawtooth", 0.07, 0],
      [150, 0.22, "sawtooth", 0.06, 0.09]
    ]),
  tick: (): void => play([[900, 0.03, "square", 0.03, 0]]),
  start: (): void =>
    play([
      [523, 0.1, "sine", 0.1, 0],
      [659, 0.1, "sine", 0.1, 0.09],
      [784, 0.18, "sine", 0.1, 0.18]
    ]),
  /** The splash sound at the end of a run, picked from how the run went. */
  score: (tier: ScoreTier): void => play(fanfares[tier])
};

/** Shared with the waveform code so both use one decoder context. */
export function audioContext(): AudioContext | null {
  return bus()?.context ?? null;
}
