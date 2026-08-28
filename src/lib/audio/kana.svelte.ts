import { AssetStore } from "../assets/loader";
import { shared } from "./shared";
import { peaksFromBytes, syntheticPeaks } from "./waveform";

// Playback of the recorded character sounds.

const store = shared(
  "kana-assets",
  () => new AssetStore({ path: (name) => `audio/${name}.mp3` })
);

class KanaAudio {
  // key of the sound playing right now, null when silent
  playing = $state<string | null>(null);

  // playback position of that sound, 0 to 1
  progress = $state(0);

  peakCache = $state<Record<string, number[]>>({});
  private decoding = new Set<string>();
  private element: HTMLAudioElement | null = null;
  private token = 0;

  private audio(): HTMLAudioElement {
    if (this.element !== null) return this.element;
    const element = new Audio();
    element.preload = "auto";
    // kept hidden in the document so tests can watch playback
    element.hidden = true;
    element.dataset.kanaAudio = "";
    document.body.append(element);
    element.addEventListener("timeupdate", () => {
      const length = element.duration;
      if (!Number.isFinite(length) || length <= 0) return;
      this.progress = element.currentTime / length;
    });
    element.addEventListener("ended", () => {
      this.playing = null;
      this.progress = 0;
    });
    this.element = element;
    return element;
  }

  // histogram bars for a sound, a placeholder shape while it is still decoding
  peaks(name: string): number[] {
    const found = this.peakCache[name];
    if (found !== undefined) return found;
    void this.decode(name);
    return syntheticPeaks(name);
  }

  private async decode(name: string): Promise<void> {
    if (this.decoding.has(name)) return;
    this.decoding.add(name);
    const asset = await store.load(name);
    this.peakCache[name] =
      asset === null ? syntheticPeaks(name) : await peaksFromBytes(asset.bytes, name);
    this.decoding.delete(name);
  }

  async play(name: string | null): Promise<void> {
    this.stop();
    if (name === null) return;

    const token = (this.token += 1);
    const asset = await store.load(name);
    if (token !== this.token || asset === null) return;

    const element = this.audio();
    if (element.src !== asset.url) element.src = asset.url;
    element.currentTime = 0;
    this.playing = name;
    this.progress = 0;
    try {
      await element.play();
    } catch {
      if (this.playing === name) this.playing = null;
    }
  }

  stop(): void {
    this.token += 1;
    if (this.element !== null) {
      this.element.pause();
      this.element.currentTime = 0;
    }
    this.playing = null;
    this.progress = 0;
  }

  // pulls files and their waveforms into memory
  preload(names: Iterable<string>): void {
    for (const name of names) {
      store.preload([name]);
      void this.decode(name);
    }
  }
}

// one instance per page, see shared
export const kanaAudio = shared("kana-audio", () => new KanaAudio());
