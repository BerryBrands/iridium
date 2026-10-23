import { useSyncExternalStore } from 'react';

/** A value in `localStorage` that components can read and write in the same tab and across tabs. */
export interface LocalStore<T> {
  /** The current value, parsed. */
  read: () => T;
  /** Writes a value and tells every reader in this tab. */
  write: (value: T) => void;
  /** Subscribes to changes from this tab and from other tabs. */
  subscribe: (listener: () => void) => () => void;
}

const stores = new Map<string, LocalStore<unknown>>();

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // A private window or blocked site data can refuse the read. The value is then the default.
    return null;
  }
}

/**
 * The store of one `localStorage` key. Every call with the same key gives the same store, so two components share
 * their readers.
 *
 * The parsed value is cached and replaced only when the stored string changes, because `useSyncExternalStore`
 * compares snapshots by identity. A fresh array for each read would re-render forever.
 *
 * @param key - The storage key.
 * @param parse - Converts the stored string, or `null`, to a value. It must not throw.
 */
export function localStore<T>(key: string, parse: (raw: string | null) => T): LocalStore<T> {
  const existing = stores.get(key);

  if (existing) return existing as LocalStore<T>;

  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cached: T;

  const store: LocalStore<T> = {
    read() {
      const raw = safeGet(key);

      if (raw !== cachedRaw) {
        cachedRaw = raw;
        cached = parse(raw);
      }

      return cached;
    },
    write(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // The preference then lasts only until the page reloads.
      }

      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      // `storage` fires only in *other* tabs, so `write` tells the readers of this tab itself.
      window.addEventListener('storage', listener);

      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
      };
    },
  };

  stores.set(key, store as LocalStore<unknown>);

  return store;
}

/**
 * Reads a {@link LocalStore} and re-renders the caller when the value changes.
 *
 * @param store - The store.
 * @param serverValue - The value before hydration.
 * @returns The current value.
 */
export function useLocalStore<T>(store: LocalStore<T>, serverValue: T): T {
  return useSyncExternalStore(store.subscribe, store.read, () => serverValue);
}

/**
 * Parses a JSON array, or gives an empty array for a missing or corrupted value.
 *
 * @param raw - The stored string.
 */
export function parseArray(raw: string | null): unknown[] {
  try {
    const value = JSON.parse(raw ?? '[]') as unknown;

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
