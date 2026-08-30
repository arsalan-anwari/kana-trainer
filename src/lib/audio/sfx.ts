// Short interface sounds, synthesised from oscillators.

import type { ScoreTier } from "../core/score";
import { shared } from "./shared";

let enabled = true;

type Step = [frequency: number, duration: number, type: OscillatorType, volume: number, delay: number];

// How far ahead nodes are scheduled, so a ramp is not cut off mid block.
const LEAD_SECONDS = 0.02;

type Bus = {
  context: AudioContext;
  // single input into the destination
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
  // unhook the nodes so they leave the graph
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
  // a suspended context has a frozen clock, so schedule only after it resumes
  void target.context
    .resume()
    .then(() => schedule(target, steps))
    .catch(() => undefined);
}

export function setEffectsEnabled(value: boolean): void {
  enabled = value;
}

// One flourish per grade.
const fanfares: Record<ScoreTier, Step[]> = {
  // a full run up the scale, landing on a held major chord with a sparkle over it
  perfect: [
    [523, 0.11, "sine", 0.11, 0],
    [659, 0.11, "sine", 0.11, 0.09],
    [784, 0.11, "sine", 0.11, 0.18],
    [1047, 0.14, "sine", 0.12, 0.27],
    [784, 0.09, "sine", 0.08, 0.42],
    [1047, 0.09, "sine", 0.09, 0.49],
    [1319, 0.38, "sine", 0.12, 0.57],
    [1047, 0.5, "triangle", 0.07, 0.57],
    [1568, 0.5, "sine", 0.06, 0.6],
    [2093, 0.28, "sine", 0.05, 0.8],
    [2637, 0.22, "sine", 0.035, 0.94]
  ],
  // four notes up, held over a chord tone, no sparkle tail
  great: [
    [587, 0.11, "sine", 0.11, 0],
    [784, 0.11, "sine", 0.11, 0.1],
    [988, 0.13, "sine", 0.11, 0.2],
    [1175, 0.34, "sine", 0.11, 0.32],
    [784, 0.34, "triangle", 0.06, 0.32],
    [1568, 0.18, "sine", 0.04, 0.48]
  ],
  // plain three note lift
  good: [
    [523, 0.13, "sine", 0.1, 0],
    [659, 0.13, "sine", 0.1, 0.12],
    [880, 0.26, "sine", 0.1, 0.24]
  ],
  // a small step up, flat and unfussy
  fair: [
    [392, 0.14, "triangle", 0.09, 0],
    [440, 0.14, "triangle", 0.09, 0.13],
    [523, 0.3, "triangle", 0.08, 0.26]
  ],
  // a deflating slide down, over a low buzz
  poor: [
    [311, 0.17, "sawtooth", 0.075, 0],
    [294, 0.17, "sawtooth", 0.075, 0.15],
    [247, 0.19, "sawtooth", 0.075, 0.3],
    [185, 0.5, "sawtooth", 0.07, 0.48],
    [92, 0.5, "triangle", 0.05, 0.48]
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
  // the splash sound at the end of a run, picked by grade
  score: (tier: ScoreTier): void => play(fanfares[tier])
};

// The shared audio context, also used by the waveform code.
export function audioContext(): AudioContext | null {
  return bus()?.context ?? null;
}
