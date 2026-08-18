let context: AudioContext | null = null;
let effectsOn = true;
let current: HTMLAudioElement | null = null;

const cache = new Map<string, HTMLAudioElement>();

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context === null) context = new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0
): void {
  const audio = ctx();
  if (audio === null) return;
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function play(steps: [number, number, OscillatorType, number, number][]): void {
  if (!effectsOn) return;
  for (const [frequency, duration, type, volume, delay] of steps) {
    tone(frequency, duration, type, volume, delay);
  }
}

export const sfx = {
  click(): void {
    play([[420, 0.05, "triangle", 0.08, 0]]);
  },
  select(): void {
    play([[620, 0.06, "triangle", 0.08, 0]]);
  },
  correct(): void {
    play([
      [660, 0.1, "sine", 0.12, 0],
      [880, 0.16, "sine", 0.12, 0.08]
    ]);
  },
  wrong(): void {
    play([
      [200, 0.16, "sawtooth", 0.07, 0],
      [150, 0.22, "sawtooth", 0.06, 0.09]
    ]);
  },
  tick(): void {
    play([[900, 0.03, "square", 0.03, 0]]);
  },
  start(): void {
    play([
      [523, 0.1, "sine", 0.1, 0],
      [659, 0.1, "sine", 0.1, 0.09],
      [784, 0.18, "sine", 0.1, 0.18]
    ]);
  },
  finish(): void {
    play([
      [659, 0.12, "sine", 0.11, 0],
      [784, 0.12, "sine", 0.11, 0.11],
      [988, 0.14, "sine", 0.11, 0.22],
      [1319, 0.24, "sine", 0.1, 0.34]
    ]);
  }
};

export function setEffectsEnabled(value: boolean): void {
  effectsOn = value;
}

function element(name: string): HTMLAudioElement {
  const found = cache.get(name);
  if (found) return found;
  const audio = new Audio(`audio/kana/${name}.mp3`);
  audio.preload = "auto";
  cache.set(name, audio);
  return audio;
}

export function playKana(name: string | null): HTMLAudioElement | null {
  if (name === null) return null;
  if (current !== null) {
    current.pause();
    current.currentTime = 0;
  }
  const audio = element(name);
  audio.currentTime = 0;
  current = audio;
  void audio.play().catch(() => undefined);
  return audio;
}

export function preloadKana(names: string[]): void {
  for (const name of names) element(name);
}
