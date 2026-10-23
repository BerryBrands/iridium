import { useMemo } from 'react';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { isInGroup } from '../paths.js';
import { useConsoleRecentGroups } from '../state/preferences.js';
import type { ConsoleGroup } from '../types.js';

/**
 * The recent areas that the viewer can still open, each with the page where the visit ended. An area that is not in
 * the groups of the provider now, or a path that no longer belongs to its area, is left out and not shown as a dead
 * link.
 *
 * @returns The recent areas, newest first.
 */
export function useRecentEntries(): { group: ConsoleGroup; path: string }[] {
  const { basePath, groups } = useConsoleConfig();
  const { recent } = useConsoleRecentGroups();

  return useMemo(() => {
    const allowed = new Map(groups.map((group) => [group.id, group]));

    return recent.flatMap(({ group: id, path }) => {
      const group = allowed.get(id);

      return group && group.href == null && isInGroup(path, basePath, group) ? [{ group, path }] : [];
    });
  }, [recent, groups, basePath]);
}
