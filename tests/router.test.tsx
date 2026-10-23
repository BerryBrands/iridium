import { act, fireEvent, render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { afterEach, describe, expect, it } from 'vitest';
import { ConsoleProvider, ConsoleRailLink, isActivePath } from '../src/index.js';

describe('isActivePath', () => {
  it('matches the exact path, or a path below it without `end`', () => {
    expect(isActivePath('/console/a', '/console/a', true)).toBe(true);
    expect(isActivePath('/console/a/b', '/console/a', true)).toBe(false);
    expect(isActivePath('/console/a/b', '/console/a', false)).toBe(true);
    expect(isActivePath('/console/ab', '/console/a', false)).toBe(false);
    expect(isActivePath('/console/a/', '/console/a?x=1', true)).toBe(true);
  });
});

describe('the browser router', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('navigates with the History API and marks the link of the new page', () => {
    window.history.replaceState(null, '', '/console/a');
    render(
      <Theme>
        <ConsoleProvider groups={[]}>
          <ConsoleRailLink to="/console/b" icon={null} label="B" end />
        </ConsoleProvider>
      </Theme>,
    );

    const link = screen.getByRole('link', { name: 'B' });

    expect(link).toHaveAttribute('href', '/console/b');
    expect(link).not.toHaveAttribute('aria-current');

    act(() => {
      fireEvent.click(link);
    });

    expect(window.location.pathname).toBe('/console/b');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('gives a modified click to the browser', () => {
    window.history.replaceState(null, '', '/console/a');
    render(
      <Theme>
        <ConsoleProvider groups={[]}>
          <ConsoleRailLink to="/console/b" icon={null} label="B" />
        </ConsoleProvider>
      </Theme>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'B' }), { metaKey: true });

    expect(window.location.pathname).toBe('/console/a');
  });
});
