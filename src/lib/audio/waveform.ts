import { audioContext } from "./sfx";

/**
 * Turns raw mp3 bytes into a small set of peak values, one per bar of the
 * histogram drawn next to a sound.
 */

export const BAR_COUNT = 40;

export async function peaksFromBytes(bytes: ArrayBuffer, key: string): Promise<number[]> {
  const audio = audioContext();
  if (audio === null) return syntheticPeaks(key);
  try {
    // decodeAudioData detaches the buffer it is given, so hand it a copy.
    const decoded = await audio.decodeAudioData(bytes.slice(0));
    return bucket(decoded.getChannelData(0));
  } catch {
    return syntheticPeaks(key);
  }
}

function bucket(samples: Float32Array): number[] {
  const size = Math.max(1, Math.floor(samples.length / BAR_COUNT));
  const peaks: number[] = [];
  let loudest = 0;

  for (let bar = 0; bar < BAR_COUNT; bar += 1) {
    const start = bar * size;
    let sum = 0;
    for (let i = start; i < start + size && i < samples.length; i += 1) {
      sum += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sum / size);
    loudest = Math.max(loudest, rms);
    peaks.push(rms);
  }

  if (loudest === 0) return peaks.map(() => 0.06);
  return peaks.map((value) => Math.max(0.06, Math.min(1, value / loudest)));
}

/** Deterministic per key, so the same character always draws the same shape. */
export function syntheticPeaks(key: string): number[] {
  let seed = 0;
  for (let i = 0; i < key.length; i += 1) seed = (seed * 31 + key.charCodeAt(i)) % 100000;
  const peaks: number[] = [];
  for (let bar = 0; bar < BAR_COUNT; bar += 1) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const noise = (seed / 2147483648) * 0.55;
    // a soft bell so the middle of the clip is the loud part
    const envelope = Math.sin((Math.PI * (bar + 0.5)) / BAR_COUNT) ** 0.7;
    peaks.push(Math.max(0.08, Math.min(1, (0.45 + noise) * envelope)));
  }
  return peaks;
}
