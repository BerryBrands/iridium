import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo } from 'react';
import { describe, expect, it } from 'vitest';
import { GROUPS, renderConsole } from './helpers.js';
import {
  useConsoleFocusMode,
  useRegisterConsoleBreadcrumbTrail,
  useRegisterConsoleSectionActions,
  useRequestConsoleFullPage,
  type ConsoleGroup,
} from '../src/index.js';

function pathname() {
  return screen.getByTestId('pathname').textContent;
}

describe('the entrance page', () => {
  it('shows a card for each group, sorted by label', () => {
    renderConsole('/console');

    const links = screen.getAllByRole('link', { name: /Catalogue|People/ });

    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/console/catalogue', '/console/people']);
    expect(screen.getByText('Products and brands')).toBeInTheDocument();
  });

  it('lists a starred group under the favourites and keeps the star in storage', async () => {
    renderConsole('/console');

    await userEvent.click(screen.getAllByRole('button', { name: 'Add to favourites' })[1]);

    expect(screen.getByRole('heading', { name: 'Favourites' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('console.favouriteGroups')!)).toEqual(['people']);
  });

  it('shows no breadcrumb bar and no rail', () => {
    renderConsole('/console');

    expect(screen.queryByRole('navigation', { name: 'Breadcrumbs' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Catalogue' })).not.toBeInTheDocument();
  });
});

describe('a group page', () => {
  it('shows the sections and their tabs in the rail, and marks the open page', () => {
    renderConsole('/console/catalogue/products/sheets-integration');

    const rail = screen.getByRole('navigation', { name: 'Catalogue' });

    expect(within(rail).getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/console/catalogue/products');
    expect(within(rail).getByRole('link', { name: 'All products' })).toHaveAttribute('href', '/console/catalogue/products');
    expect(within(rail).getByRole('link', { name: 'Sheets integration' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Products page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Product registry' })).toBeInTheDocument();
  });

  it('shows the trail back to the entrance page, with the tab as text', () => {
    renderConsole('/console/catalogue/products/sheets-integration');

    const crumbs = within(screen.getByRole('navigation', { name: 'Breadcrumbs' }));

    expect(crumbs.getByRole('link', { name: 'Console' })).toHaveAttribute('href', '/console');
    expect(crumbs.getByRole('link', { name: 'Catalogue' })).toHaveAttribute('href', '/console/catalogue');
    expect(crumbs.getByRole('link', { name: 'Product registry' })).toHaveAttribute('href', '/console/catalogue/products');
    expect(crumbs.getByText('Sheets integration')).toHaveAttribute('aria-current', 'page');
  });

  it('leaves a hidden tab out of the rail and the search, but names it in the breadcrumbs', async () => {
    renderConsole('/console/catalogue/products/archive');

    expect(within(screen.getByRole('navigation', { name: 'Catalogue' })).queryByRole('link', { name: 'Archive' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Breadcrumbs' })).getByText('Archive')).toHaveAttribute('aria-current', 'page');

    await userEvent.type(screen.getByRole('textbox', { name: 'Search the console' }), 'archive');

    expect(screen.getByText('Nothing matches “archive”')).toBeInTheDocument();
  });

  it('collapses the rail and keeps the preference', async () => {
    renderConsole('/console/catalogue/brands');

    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    expect(screen.getByRole('navigation', { name: 'Catalogue', hidden: true })).toHaveAttribute('data-collapsed');
    expect(localStorage.getItem('console.sidebarCollapsed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('the header search', () => {
  it('finds a tab by its label and opens it', async () => {
    renderConsole('/console');

    await userEvent.type(screen.getByRole('textbox', { name: 'Search the console' }), 'sheets');
    await userEvent.click(screen.getByRole('option', { name: /Sheets integration/ }));

    expect(pathname()).toBe('/console/catalogue/products/sheets-integration');
  });

  it('finds a section by its slug and opens it with Enter', async () => {
    renderConsole('/console');

    await userEvent.type(screen.getByRole('textbox', { name: 'Search the console' }), 'brands{Enter}');

    expect(pathname()).toBe('/console/catalogue/brands');
  });

  it('tells when nothing matches', async () => {
    renderConsole('/console');

    await userEvent.type(screen.getByRole('textbox', { name: 'Search the console' }), 'zzz');

    expect(screen.getByText('Nothing matches “zzz”')).toBeInTheDocument();
  });

  it('takes the focus on the slash key', () => {
    renderConsole('/console');

    fireEvent.keyDown(window, { key: '/' });

    expect(screen.getByRole('textbox', { name: 'Search the console' })).toHaveFocus();
  });
});

describe('the recent bar and the switcher', () => {
  it('records the visits and shows a chip for each area, newest first', async () => {
    renderConsole('/console/people/users');

    await userEvent.type(screen.getByRole('textbox', { name: 'Search the console' }), 'brands{Enter}');

    const bar = within(screen.getByRole('navigation', { name: 'Recent areas' }));

    expect(bar.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/console/catalogue/brands',
      '/console/people/users',
    ]);
    expect(bar.getByRole('link', { name: /Catalogue/ })).toHaveAttribute('aria-current', 'true');
    expect(bar.getByText('to switch')).toBeInTheDocument();
  });

  it('goes to the previous area when Option is released after one Tab', () => {
    localStorage.setItem(
      'console.recentGroups',
      JSON.stringify([
        { group: 'catalogue', path: '/console/catalogue/brands' },
        { group: 'people', path: '/console/people/users' },
      ]),
    );
    renderConsole('/console/catalogue/brands');

    fireEvent.keyDown(document, { key: 'Tab', altKey: true });

    const dialog = screen.getByRole('dialog', { name: 'Switch area' });

    expect(within(dialog).getByRole('button', { name: 'People' })).toHaveAttribute('aria-current', 'true');

    fireEvent.keyUp(document, { key: 'Alt' });

    expect(pathname()).toBe('/console/people/users');
    expect(screen.queryByRole('dialog', { name: 'Switch area' })).not.toBeInTheDocument();
  });

  it('cancels the switch on Escape', () => {
    localStorage.setItem(
      'console.recentGroups',
      JSON.stringify([
        { group: 'catalogue', path: '/console/catalogue/brands' },
        { group: 'people', path: '/console/people/users' },
      ]),
    );
    renderConsole('/console/catalogue/brands');

    fireEvent.keyDown(document, { key: 'Tab', altKey: true });
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyUp(document, { key: 'Alt' });

    expect(pathname()).toBe('/console/catalogue/brands');
  });

  it('leaves out an area that the viewer can no longer open, and a corrupted entry', () => {
    localStorage.setItem(
      'console.recentGroups',
      JSON.stringify([
        { group: 'gone', path: '/console/gone' },
        { group: 'people', path: '/elsewhere' },
        42,
        { group: 'catalogue', path: '/console/catalogue' },
      ]),
    );
    renderConsole('/console/people/users');

    const bar = within(screen.getByRole('navigation', { name: 'Recent areas' }));

    expect(bar.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/console/people/users', '/console/catalogue']);
  });
});

describe('the slots of a page', () => {
  function withPage(Page: () => React.ReactNode): ConsoleGroup[] {
    return [{ ...GROUPS[1], sections: [{ ...GROUPS[1].sections[0], component: Page }] }];
  }

  it('puts the actions of the page in the section header', () => {
    function Page() {
      useRegisterConsoleSectionActions(useMemo(() => <button type="button">Invite</button>, []));

      return <p>Body</p>;
    }

    renderConsole('/console/people/users', withPage(Page));

    expect(screen.getByRole('heading', { name: 'Users' }).parentElement?.parentElement).toContainElement(
      screen.getByRole('button', { name: 'Invite' }),
    );
  });

  it('gives the crumbs of the page to the breadcrumb bar', () => {
    function Page() {
      useRegisterConsoleBreadcrumbTrail(useMemo(() => ({ crumbs: [{ key: 'u', label: 'Ada' }], end: <span>3 of 9</span> }), []));

      return null;
    }

    renderConsole('/console/people/users', withPage(Page));

    const bar = within(screen.getByRole('navigation', { name: 'Breadcrumbs' }));

    expect(bar.getByText('Ada')).toHaveAttribute('aria-current', 'page');
    expect(bar.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
    expect(screen.getByText('3 of 9')).toBeInTheDocument();
  });

  it('hides the section header for a full page view', () => {
    function Page() {
      useRequestConsoleFullPage(true);

      return <p>Record</p>;
    }

    renderConsole('/console/people/users', withPage(Page));

    expect(screen.getByRole('main')).toHaveAttribute('data-full-page');
    expect(screen.queryByRole('heading', { name: 'Users' })).not.toBeInTheDocument();
  });

  it('hides the chrome in focus mode', () => {
    function Page() {
      const { setFocused } = useConsoleFocusMode();

      return (
        <button type="button" onClick={() => setFocused(true)}>
          Maximise
        </button>
      );
    }

    const { container } = renderConsole('/console/people/users', withPage(Page));

    act(() => screen.getByRole('button', { name: 'Maximise' }).click());

    expect(container.querySelector('[data-console-shell]')).toHaveAttribute('data-focus', 'true');
  });
});

describe('the options for a host with dynamic content', () => {
  it('renders the children as the content pane of the open group, with the rail and the breadcrumbs', () => {
    renderConsole('/console/people/users', GROUPS, undefined, { children: <p>Room ab12</p> });

    expect(screen.getByRole('main')).toHaveTextContent('Room ab12');
    expect(screen.queryByText('Users page')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'People' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumbs' })).toBeInTheDocument();
  });

  it('shows every group in the area bar, and no switcher, when asked', () => {
    renderConsole('/console/people/users', GROUPS, undefined, { areaBar: 'all', switcher: false });

    const bar = within(screen.getByRole('navigation', { name: 'Recent areas' }));

    expect(bar.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/console/catalogue', '/console/people/users']);

    fireEvent.keyDown(document, { key: 'Tab', altKey: true });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows no area bar when asked', () => {
    localStorage.setItem('console.recentGroups', JSON.stringify([{ group: 'people', path: '/console/people/users' }]));
    renderConsole('/console/people/users', GROUPS, undefined, { areaBar: 'none' });

    expect(screen.queryByRole('navigation', { name: 'Recent areas' })).not.toBeInTheDocument();
  });

  it('links an external group out of the console, with no star and no visit record', async () => {
    const groups: ConsoleGroup[] = [
      ...GROUPS,
      { id: 'builder', slug: 'builder', label: 'Map builder', icon: null, accent: 'blue', href: '/?builder=1', sections: [] },
    ];

    renderConsole('/console', groups);

    const card = screen.getByRole('link', { name: /Map builder/ });

    expect(card).toHaveAttribute('href', '/?builder=1');
    expect(card.parentElement?.querySelector('button')).toBeNull();

    await userEvent.type(screen.getByRole('textbox', { name: 'Search the console' }), 'map');

    expect(screen.getByRole('option', { name: /Map builder/ })).toBeInTheDocument();
  });

  it('adds the results of the search source after the registry', async () => {
    renderConsole('/console', GROUPS, undefined, undefined, (query) =>
      query.startsWith('ab') ? [{ id: 'ab12', label: 'Room ab12', context: 'Live rooms', to: '/console/people/users?room=ab12' }] : [],
    );

    await userEvent.type(screen.getByRole('textbox', { name: 'Search the console' }), 'ab');
    await userEvent.click(screen.getByRole('option', { name: /Room ab12/ }));

    expect(pathname()).toBe('/console/people/users');
  });

  it('keeps the crumbs of the section when a view gives only an end control', () => {
    function Page() {
      useRegisterConsoleBreadcrumbTrail(useMemo(() => ({ end: <span>updated 2s ago</span> }), []));

      return null;
    }

    renderConsole('/console/people/users', [{ ...GROUPS[1], sections: [{ ...GROUPS[1].sections[0], component: Page }] }]);

    const bar = within(screen.getByRole('navigation', { name: 'Breadcrumbs' }));

    expect(bar.getByText('Users')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('updated 2s ago')).toBeInTheDocument();
  });
});
