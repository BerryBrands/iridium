import { useConsoleConfig } from '../ConsoleProvider.js';
import { groupPath, isInGroup } from '../paths.js';
import type { ConsoleGroup } from '../types.js';
import { ConsoleLink } from './links.js';
import { useRecentEntries } from './useRecentEntries.js';
import s from './shell.module.css';

/** The props of {@link ConsoleRecentBar}. */
export interface ConsoleRecentBarProps {
  /**
   * `recent` (the default) shows the areas visited most recently. `all` shows every group in the order of the
   * provider, and each chip goes back to the page where the last visit of its area ended.
   */
  mode?: 'recent' | 'all';
  /** Shows the Option+Tab hint after the chips. The default is true. */
  switchHint?: boolean;
}

/**
 * A row of area chips between the header and the breadcrumbs. Each chip goes back to the page where the last visit of
 * its area ended, not only to the front of the area. The chip of the open area is marked.
 *
 * In `recent` mode it renders nothing until there is a trail, so a first visit does not show an empty strip.
 *
 * @param props - See {@link ConsoleRecentBarProps}.
 */
export function ConsoleRecentBar({ mode = 'recent', switchHint = true }: ConsoleRecentBarProps) {
  const { basePath, groups, labels, router } = useConsoleConfig();
  const recent = useRecentEntries();
  const lastPath = new Map(recent.map(({ group, path }) => [group.id, path]));
  const chips: { group: ConsoleGroup; path: string }[] =
    mode === 'all' ? groups.map((group) => ({ group, path: lastPath.get(group.id) ?? groupPath(basePath, group) })) : recent;

  if (chips.length === 0) return null;

  return (
    <nav className={s.recentBar} aria-label={labels.recent}>
      {/* The trail scrolls. The hint after it stays. */}
      <div className={s.recentTrail}>
        {chips.map(({ group, path }) => {
          // The chip is the whole area, so it stays marked anywhere inside the area.
          const here = group.href == null && isInGroup(router.pathname, basePath, group);

          return (
            <ConsoleLink
              key={group.id}
              to={path}
              href={group.href}
              className={s.recentChip}
              data-ir-accent={group.accent}
              data-active={here || undefined}
              aria-current={here ? 'true' : undefined}
            >
              <span className={s.recentChipIcon}>{group.icon}</span>
              {group.label}
            </ConsoleLink>
          );
        })}
      </div>

      {/* The switcher has an effect only with a second recent area, so the hint shows on the same condition. */}
      {switchHint && recent.length > 1 && (
        <span className={s.recentHint}>
          <kbd className={s.recentKey}>⌥</kbd>
          <kbd className={s.recentKey}>⇥</kbd>
          {labels.switchHint}
        </span>
      )}
    </nav>
  );
}
