import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { ConsoleProvider, RECENT_GROUPS_LIMIT, useConsoleFavourites, useConsoleRecentGroups, useConsoleSidebar } from '../src/index.js';

function wrapper(prefix = 'console') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ConsoleProvider groups={[]} storagePrefix={prefix}>
        {children}
      </ConsoleProvider>
    );
  };
}

describe('the preferences in storage', () => {
  it('reads a bare flag from an earlier host as collapsed', () => {
    localStorage.setItem('console.sidebarCollapsed', '1');

    const { result } = renderHook(() => useConsoleSidebar(), { wrapper: wrapper() });

    expect(result.current.collapsed).toBe(true);

    act(() => result.current.toggleCollapsed());

    expect(result.current.collapsed).toBe(false);
  });

  it('keeps one entry for each area, newest first, up to the limit', () => {
    const { result } = renderHook(() => useConsoleRecentGroups(), { wrapper: wrapper() });

    act(() => {
      for (let i = 0; i < RECENT_GROUPS_LIMIT + 3; i++) result.current.remember(`g${i}`, `/console/g${i}`);
      result.current.remember('g5', '/console/g5/page');
    });

    expect(result.current.recent).toHaveLength(RECENT_GROUPS_LIMIT);
    expect(result.current.recent[0]).toEqual({ group: 'g5', path: '/console/g5/page' });
    expect(result.current.recent.filter((entry) => entry.group === 'g5')).toHaveLength(1);
  });

  it('reads a corrupted value as empty', () => {
    localStorage.setItem('admin.favouriteGroups', '{not json');

    const { result } = renderHook(() => useConsoleFavourites(), { wrapper: wrapper('admin') });

    expect(result.current.favourites).toEqual([]);

    act(() => result.current.toggleFavourite('people'));

    expect(result.current.isFavourite('people')).toBe(true);
    expect(localStorage.getItem('admin.favouriteGroups')).toBe('["people"]');
  });

  it('shares a value between two readers', () => {
    const first = renderHook(() => useConsoleFavourites(), { wrapper: wrapper() });
    const second = renderHook(() => useConsoleFavourites(), { wrapper: wrapper() });

    act(() => first.result.current.toggleFavourite('a'));

    expect(second.result.current.favourites).toEqual(['a']);
  });
});
