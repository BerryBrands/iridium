import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { groupPath, sectionPath } from '../paths.js';
import { useIsMobileViewport } from '../state/useIsMobileViewport.js';
import s from './shell.module.css';

/** One destination in the search index: a group, a section, one of its tabs, or a result of the search source. */
interface SearchEntry {
  key: string;
  path: string;
  /** True for a group that links out of the console. */
  external?: boolean;
  label: string;
  /** The name of the parent, on the trailing side of a result. */
  context: string;
  icon: ReactNode;
  /** The lower-case text to match: the label, the context and the slugs. */
  haystack: string;
}

/** How many results the list shows. */
const MAX_RESULTS = 8;

/**
 * Whether every term of `query` is in `haystack`.
 *
 * @param haystack - The lower-case text to search.
 * @param query - The query of the person.
 */
function matches(haystack: string, query: string): boolean {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

/**
 * The header search, which finds a group, a section or a tab from a typed query. The index has the slugs as well as
 * the labels, so a fragment of a URL ("user-settings") also works.
 *
 * The `/` key focuses the search from anywhere in the console, but not when the caret is in a field.
 */
export function ConsoleSearch() {
  const { basePath, groups, labels, router, searchSource } = useConsoleConfig();
  const isMobile = useIsMobileViewport();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const entries = useMemo<SearchEntry[]>(() => {
    const all: SearchEntry[] = [];

    for (const group of groups) {
      if (group.href != null) {
        all.push({
          key: `group:${group.id}`,
          path: group.href,
          external: true,
          label: group.label,
          context: '',
          icon: group.icon,
          haystack: `${group.label} ${group.slug}`.toLowerCase(),
        });

        continue;
      }

      if (group.sections.length === 0 && !group.landing) continue;

      all.push({
        key: `group:${group.id}`,
        path: groupPath(basePath, group),
        label: group.label,
        context: '',
        icon: group.icon,
        haystack: `${group.label} ${group.slug}`.toLowerCase(),
      });

      for (const section of group.sections) {
        all.push({
          key: `section:${group.id}:${section.id}`,
          path: sectionPath(basePath, group, section),
          label: section.label,
          context: group.label,
          icon: section.icon,
          haystack: `${section.label} ${group.label} ${section.slug}`.toLowerCase(),
        });

        // Tabs have their own paths, so they are in the index too.
        for (const tab of section.tabs ?? []) {
          if (tab.hidden) continue;

          all.push({
            key: `tab:${group.id}:${section.id}:${tab.id}`,
            path: `${sectionPath(basePath, group, section)}/${tab.slug}`,
            label: tab.label,
            context: section.label,
            icon: tab.icon ?? section.icon,
            haystack: `${tab.label} ${section.label} ${section.slug} ${tab.slug}`.toLowerCase(),
          });
        }
      }
    }

    return all;
  }, [basePath, groups]);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const own = entries.filter((entry) => matches(entry.haystack, query));
    // The results of the host come after the registry, because a person usually types the name of a page.
    const extra = (searchSource?.(query.trim()) ?? []).map((result): SearchEntry => ({
      key: `source:${result.id}`,
      path: result.to,
      label: result.label,
      context: result.context ?? '',
      icon: result.icon,
      haystack: '',
    }));

    return [...own, ...extra].slice(0, MAX_RESULTS);
  }, [entries, query, searchSource]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;

      if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) return;

      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function go(entry: SearchEntry) {
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();

    if (entry.external) window.location.assign(entry.path);
    else router.navigate(entry.path);
  }

  function onKeyDown(event: ReactKeyboardEvent) {
    if (event.key === 'Escape') {
      setQuery('');
      setOpen(false);
      inputRef.current?.blur();

      return;
    }

    if (!results.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(results[activeIndex] ?? results[0]);
    }
  }

  const showResults = open && query.trim().length > 0;

  return (
    <div className={s.search}>
      <TextField.Root
        ref={inputRef}
        className={s.searchField}
        size="2"
        value={query}
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchPlaceholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          // The highlight resets here and not in an effect on `query`, because an effect costs a second render.
          setActiveIndex(0);
        }}
        onFocus={() => setOpen(true)}
        // The blur waits, so that a click on a result lands before the list closes.
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
        {/* A touch keyboard has no shortcut to show. */}
        {!isMobile && (
          <TextField.Slot side="right">
            <span className={s.searchShortcut}>/</span>
          </TextField.Slot>
        )}
      </TextField.Root>

      {showResults && (
        <div
          className={s.searchResults}
          role="listbox"
          aria-label={labels.searchResults}
          // The input keeps the focus, so a tap on a result does not close the list before the tap lands.
          onMouseDown={(event) => event.preventDefault()}
        >
          {results.length === 0 ? (
            <p className={s.searchEmpty}>{labels.searchNoResults(query)}</p>
          ) : (
            results.map((entry, index) => (
              <button
                key={entry.key}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                data-active={index === activeIndex}
                className={s.searchResult}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => go(entry)}
              >
                <span className={s.searchResultIcon}>{entry.icon}</span>
                <span>{entry.label}</span>
                <span className={s.searchResultGroup}>{entry.context}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
