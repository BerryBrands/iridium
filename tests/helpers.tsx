import type { ReactElement, ReactNode } from 'react';
import type { ConsoleSearchSource, ConsoleShellProps } from '../src/index.js';
import { render } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { MemoryRouter, Route, Routes, useLocation, useParams } from 'react-router';
import { ConsoleShell, ConsoleHome, findGroupBySlug, findSectionBySlug, type ConsoleGroup } from '../src/index.js';
import { ReactRouterConsoleProvider } from '../src/react-router.js';

/** Two groups: one with a tabbed section and a plain section, and one with a single section. */
export const GROUPS: ConsoleGroup[] = [
  {
    id: 'catalogue',
    slug: 'catalogue',
    label: 'Catalogue',
    description: 'Products and brands',
    icon: <svg data-testid="icon-catalogue" />,
    accent: 'indigo',
    sections: [
      {
        id: 'products',
        slug: 'products',
        label: 'Products',
        title: 'Product registry',
        icon: <svg />,
        component: () => <p>Products page</p>,
        tabs: [
          { id: 'list', slug: 'list', label: 'All products' },
          { id: 'sheetsIntegration', slug: 'sheets-integration', label: 'Sheets integration' },
          { id: 'archive', slug: 'archive', label: 'Archive', hidden: true },
        ],
      },
      { id: 'brands', slug: 'brands', label: 'Brands', icon: <svg />, component: () => <p>Brands page</p> },
    ],
  },
  {
    id: 'people',
    slug: 'people',
    label: 'People',
    description: 'Users and roles',
    icon: <svg />,
    accent: 'green',
    sections: [{ id: 'users', slug: 'users', label: 'Users', icon: <svg />, component: () => <p>Users page</p> }],
  },
];

/** Shows the current pathname, so a test can assert a navigation. */
export function LocationProbe() {
  const { pathname } = useLocation();

  return <output data-testid="pathname">{pathname}</output>;
}

function ConsoleRoute({ groups, shell }: { groups: readonly ConsoleGroup[]; shell?: Partial<ConsoleShellProps> }) {
  const params = useParams<{ group?: string; section?: string }>();
  const group = findGroupBySlug(groups, params.group);
  const section = group ? findSectionBySlug(group, params.section) : undefined;

  return (
    <ConsoleShell group={group} section={section} logo={<span>Logo</span>} home={<ConsoleHome description="Pick an area" />} {...shell} />
  );
}

/**
 * Renders the console at a path, inside a theme and a memory router.
 *
 * @param path - The first path.
 * @param groups - The groups of the provider.
 * @param extra - More elements inside the router, for example a probe.
 * @param shell - More props of the shell.
 * @param searchSource - The search source of the provider.
 */
export function renderConsole(
  path: string,
  groups: readonly ConsoleGroup[] = GROUPS,
  extra?: ReactNode,
  shell?: Partial<ConsoleShellProps>,
  searchSource?: ConsoleSearchSource,
) {
  return render(
    <Theme>
      <MemoryRouter initialEntries={[path]}>
        <ReactRouterConsoleProvider groups={groups} searchSource={searchSource}>
          <Routes>
            <Route path="/console/:group?/:section?/:tab?" element={<ConsoleRoute groups={groups} shell={shell} />} />
          </Routes>
          <LocationProbe />
          {extra}
        </ReactRouterConsoleProvider>
      </MemoryRouter>
    </Theme>,
  );
}

/**
 * Renders an element inside a theme and a memory router. `rerender` keeps the same wrappers.
 *
 * @param element - The element.
 */
export function renderThemed(element: ReactElement) {
  const wrap = (child: ReactElement) => (
    <Theme>
      <MemoryRouter>{child}</MemoryRouter>
    </Theme>
  );
  const result = render(wrap(element));

  return { ...result, rerender: (next: ReactElement) => result.rerender(wrap(next)) };
}
