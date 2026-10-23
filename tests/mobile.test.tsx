import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderConsole } from './helpers.js';

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }));
}

describe('a phone', () => {
  beforeEach(() => mockMatchMedia(true));
  afterEach(() => vi.unstubAllGlobals());

  it('shows the menu button in place of the logo, and no breadcrumbs', () => {
    renderConsole('/console/catalogue/brands');

    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-controls', 'console-group-nav');
    expect(screen.queryByText('Logo')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Breadcrumbs' })).not.toBeInTheDocument();
  });

  it('opens the drawer, and closes it with the close button', async () => {
    renderConsole('/console/catalogue/brands');

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('navigation', { name: 'Catalogue' })).toHaveAttribute('data-drawer-open');
    expect(screen.getByRole('link', { name: 'All areas' })).toHaveAttribute('href', '/console');
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getByRole('navigation', { name: 'Catalogue', hidden: true })).not.toHaveAttribute('data-drawer-open');
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus();
  });

  it('closes the drawer on a navigation from it', async () => {
    renderConsole('/console/catalogue/brands');

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    await userEvent.click(screen.getByRole('link', { name: 'Products' }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/console/catalogue/products');
    expect(screen.getByRole('navigation', { name: 'Catalogue', hidden: true })).not.toHaveAttribute('data-drawer-open');
  });
});
