// Keeps one instance per key for the lifetime of the page.

type Registry = Map<string, unknown>;

const registry: Registry = ((globalThis as { __kanaAudioShared?: Registry }).__kanaAudioShared ??=
  new Map());

export function shared<T>(key: string, create: () => T): T {
  if (!registry.has(key)) registry.set(key, create());
  return registry.get(key) as T;
}
