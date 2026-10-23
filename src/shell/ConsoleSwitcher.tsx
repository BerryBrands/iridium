import { useCallback, useEffect, useRef, useState } from 'react';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { useRecentEntries } from './useRecentEntries.js';
import s from './shell.module.css';

/**
 * The area switcher: hold <kbd>Option</kbd> and press <kbd>Tab</kbd> to step through the recent areas, then release
 * to go.
 *
 * It works as the macOS application switcher does. The list is most recent first with the current area first, so one
 * press selects the previous area. The order stays the same while the key is held. <kbd>Shift</kbd> steps back, and
 * Escape cancels. Nothing navigates until Option is released.
 *
 * It uses Option and not Command, because the browser owns most Command chords and macOS owns Command+Tab.
 */
export function ConsoleSwitcher() {
  const { labels, router } = useConsoleConfig();
  const { navigate } = router;
  const entries = useRecentEntries();
  const [selected, setSelected] = useState<number | null>(null);

  // The handlers are bound once, so they read the live list and selection through refs.
  const entriesRef = useRef(entries);
  const selectedRef = useRef<number | null>(null);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const select = useCallback((next: number | null) => {
    selectedRef.current = next;
    setSelected(next);
  }, []);

  const commit = useCallback(() => {
    const index = selectedRef.current;
    const target = index != null ? entriesRef.current[index] : undefined;

    select(null);

    if (target) navigate(target.path);
  }, [navigate, select]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && selectedRef.current != null) {
        event.preventDefault();
        select(null);

        return;
      }

      if (event.key !== 'Tab' || !event.altKey) return;
      // With one area there is nowhere to switch to, and to take the Tab key would break focus navigation.
      if (entriesRef.current.length < 2) return;

      event.preventDefault();

      const from = selectedRef.current ?? 0;
      const step = event.shiftKey ? -1 : 1;

      select((from + step + entriesRef.current.length) % entriesRef.current.length);
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === 'Alt' && selectedRef.current != null) commit();
    }

    // When the window loses focus during the hold, the release does not arrive. The switch is then cancelled.
    function onBlur() {
      select(null);
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [commit, select]);

  if (selected == null) return null;

  return (
    <div className={s.switcherOverlay} role="dialog" aria-modal="true" aria-label={labels.switcher}>
      <div className={s.switcherPanel}>
        {entries.map(({ group }, index) => (
          <button
            key={group.id}
            type="button"
            className={s.switcherTile}
            data-ir-accent={group.accent}
            data-selected={index === selected || undefined}
            aria-current={index === selected ? 'true' : undefined}
            // A click also commits, so the overlay works with a mouse.
            onClick={() => {
              select(index);
              commit();
            }}
          >
            <span className={s.switcherTileIcon}>{group.icon}</span>
            <span className={s.switcherTileLabel}>{group.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
