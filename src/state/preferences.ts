import { useCallback } from 'react';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { localStore, parseArray, useLocalStore } from './localStore.js';

/** How many areas the recent list keeps before it drops the oldest. */
export const RECENT_GROUPS_LIMIT = 12;

/** One recently visited console area, and the page where the visit ended. */
export interface RecentConsoleGroup {
  /** The id of the group. */
  group: string;
  /** The pathname inside the group: the section and the tab that the visit ended on. */
  path: string;
}

const EMPTY: never[] = [];

function sidebarStore(prefix: string) {
  // A bare `1` also counts, for a host that stored the flag without JSON before it used this package.
  return localStore(`${prefix}.sidebarCollapsed`, (raw) => raw === 'true' || raw === '1');
}

function favouritesStore(prefix: string) {
  return localStore(`${prefix}.favouriteGroups`, (raw) => parseArray(raw).filter((id): id is string => typeof id === 'string'));
}

function recentStore(prefix: string) {
  return localStore(`${prefix}.recentGroups`, (raw) =>
    parseArray(raw)
      .filter((entry): entry is RecentConsoleGroup => {
        if (typeof entry !== 'object' || entry === null) return false;

        const { group, path } = entry as Partial<RecentConsoleGroup>;

        return typeof group === 'string' && typeof path === 'string';
      })
      .slice(0, RECENT_GROUPS_LIMIT),
  );
}

/**
 * Whether the group rail is collapsed, and a toggle. The preference is per device, in `localStorage`. The default is
 * expanded, so a first visit shows the full navigation.
 *
 * @returns The collapsed flag and a toggle.
 */
export function useConsoleSidebar(): { collapsed: boolean; toggleCollapsed: () => void } {
  const { storagePrefix } = useConsoleConfig();
  const store = sidebarStore(storagePrefix);
  const collapsed = useLocalStore(store, false);
  const toggleCollapsed = useCallback(() => store.write(!store.read()), [store]);

  return { collapsed, toggleCollapsed };
}

/**
 * The favourite groups of the viewer, as ids in storage order. The list in storage can name a group that the viewer
 * cannot open now; the entrance page shows only the groups that it has.
 *
 * @returns The favourite ids, a membership test, and a toggle.
 */
export function useConsoleFavourites(): {
  favourites: readonly string[];
  isFavourite: (groupId: string) => boolean;
  toggleFavourite: (groupId: string) => void;
} {
  const { storagePrefix } = useConsoleConfig();
  const store = favouritesStore(storagePrefix);
  const favourites = useLocalStore(store, EMPTY);

  const toggleFavourite = useCallback(
    (groupId: string) => {
      const current = store.read();

      store.write(current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId]);
    },
    [store],
  );

  const isFavourite = useCallback((groupId: string) => favourites.includes(groupId), [favourites]);

  return { favourites, isFavourite, toggleFavourite };
}

/**
 * The console areas visited most recently, newest first, each with the page where the visit ended. The list is per
 * device, in `localStorage`, because a request for each navigation has no value.
 *
 * @returns The recent areas and `remember`, which records a visit.
 */
export function useConsoleRecentGroups(): {
  recent: readonly RecentConsoleGroup[];
  remember: (groupId: string, path: string) => void;
} {
  const { storagePrefix } = useConsoleConfig();
  const store = recentStore(storagePrefix);
  const recent = useLocalStore(store, EMPTY);

  const remember = useCallback(
    (groupId: string, path: string) => {
      const current = store.read();
      // A second visit to an area moves it to the front and updates its page. It does not add a second entry.
      const next = [{ group: groupId, path }, ...current.filter((entry) => entry.group !== groupId)].slice(0, RECENT_GROUPS_LIMIT);

      if (JSON.stringify(next) === JSON.stringify(current)) return;

      store.write(next);
    },
    [store],
  );

  return { recent, remember };
}
