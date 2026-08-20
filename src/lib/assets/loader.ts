/**
 * One place to load a file that ships inside the app bundle.
 */

export type Asset = {
  key: string;
  path: string;
  url: string;
  bytes: ArrayBuffer;
};

type Entry = {
  asset: Asset | null;
  pending: Promise<Asset | null> | null;
};

export type AssetStoreOptions = {
  /** Turns a short key such as `seion/a` into a bundle path such as `audio/seion/a.mp3`. */
  path: (key: string) => string;
};

export class AssetStore {
  #entries = new Map<string, Entry>();
  #path: (key: string) => string;

  constructor(options: AssetStoreOptions) {
    this.#path = options.path;
  }

  /** The asset if it is already in memory, otherwise `null`. Never fetches. */
  peek(key: string): Asset | null {
    return this.#entries.get(key)?.asset ?? null;
  }

  /** Fetches once and caches. Resolves to `null` when the file cannot be read. */
  load(key: string): Promise<Asset | null> {
    const existing = this.#entries.get(key);
    if (existing?.asset) return Promise.resolve(existing.asset);
    if (existing?.pending) return existing.pending;

    const path = this.#path(key);
    const pending = fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error(`${path} responded ${response.status}`);
        return response.arrayBuffer();
      })
      .then((bytes) => {
        const asset: Asset = {
          key,
          path,
          bytes,
          url: URL.createObjectURL(new Blob([bytes]))
        };
        this.#entries.set(key, { asset, pending: null });
        return asset;
      })
      .catch(() => {
        this.#entries.delete(key);
        return null;
      });

    this.#entries.set(key, { asset: null, pending });
    return pending;
  }

  /** Warms the cache without waiting for it. */
  preload(keys: Iterable<string>): void {
    for (const key of keys) void this.load(key);
  }

  release(key: string): void {
    const entry = this.#entries.get(key);
    if (entry?.asset) URL.revokeObjectURL(entry.asset.url);
    this.#entries.delete(key);
  }

  clear(): void {
    for (const key of [...this.#entries.keys()]) this.release(key);
  }
}
