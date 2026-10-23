# iridium

A console shell and admin primitives for React 19 and [Radix Themes](https://www.radix-ui.com/themes).

- An entrance page with a card for each area, and favourites.
- A header with a search that finds areas, pages, sub-pages and records of your own.
- A breadcrumb bar with a rail toggle and a slot for controls of the page.
- A row of area chips, and an <kbd>Option</kbd>+<kbd>Tab</kbd> switcher between the recent areas.
- A rail of pages and sub-pages in each area, which becomes a drawer on a phone.
- A side panel column for editors, a form shell, and a focus mode.
- A data table with search, selection, bulk delete, filters, pagination and a card layout on a phone.

The package has no i18n library, no router requirement and no icon set. You give the strings, the icons and the router.

## Install

```bash
npm install @berrybrands/iridium @radix-ui/themes react react-dom
```

React Router 7 is an optional peer dependency. Import the stylesheet once:

```ts
import '@radix-ui/themes/styles.css';
import '@berrybrands/iridium/styles.css';
```

## Quick start

```tsx
import { lazy } from 'react';
import { Theme } from '@radix-ui/themes';
import { ConsoleHome, ConsoleShell, findGroupBySlug, findSectionBySlug, type ConsoleGroup } from '@berrybrands/iridium';
import { ReactRouterConsoleProvider } from '@berrybrands/iridium/react-router';
import { useParams } from 'react-router';
import { GearIcon, PersonIcon } from '@radix-ui/react-icons';

const groups: ConsoleGroup[] = [
  {
    id: 'people',
    slug: 'people',
    label: 'People',
    description: 'Users and their roles',
    icon: <PersonIcon />,
    accent: 'green',
    sections: [
      {
        id: 'users',
        slug: 'users',
        label: 'Users',
        icon: <PersonIcon />,
        component: lazy(() => import('./UsersPage.js')),
        tabs: [
          { id: 'all', slug: 'all', label: 'All users' },
          { id: 'banned', slug: 'banned', label: 'Banned' },
        ],
      },
      { id: 'settings', slug: 'settings', label: 'Settings', icon: <GearIcon />, component: SettingsPage },
    ],
  },
];

function ConsoleRoute() {
  const params = useParams();
  const group = findGroupBySlug(groups, params.group);
  const section = group && findSectionBySlug(group, params.section);

  return <ConsoleShell group={group} section={section} logo={<Logo />} home={<ConsoleHome description="Pick an area." />} />;
}

// <Route path="/console/:group?/:section?/:tab?" element={<Console />} />
export function Console() {
  return (
    <Theme>
      <ReactRouterConsoleProvider groups={groups}>
        <ConsoleRoute />
      </ReactRouterConsoleProvider>
    </Theme>
  );
}
```

The host renders the Radix `Theme`. The package never renders one, so your appearance, accent and radius apply.

## Concepts

| Term    | Path                                 | Where it shows                                           |
| ------- | ------------------------------------ | -------------------------------------------------------- |
| Group   | `<basePath>/<group>`                 | A card on the entrance page, a chip, a search result     |
| Section | `<basePath>/<group>/<section>`       | A primary link of the rail, with an icon                 |
| Tab     | `<basePath>/<group>/<section>/<tab>` | A secondary link under its section. The first is default |

Give the provider only the groups and the sections that the viewer can open. The package does no access control, so
the search, the rail and the recent list cannot offer a page that the viewer cannot see.

A group with `href` is a link out of the console. A group with `nav` replaces the default rail with your own links,
inside `ConsoleRail`. A group whose content is not a list of sections, for example live records, gives the content as
the `children` of `ConsoleShell`.

## Strings

Each component takes strings that you already translated. `ConsoleProvider` takes `labels`, a partial
`ConsoleLabels`. The missing strings come from `englishConsoleLabels`. `DataTable` takes `labels` in the same way, from
`englishDataTableLabels`.

```tsx
<ConsoleProvider groups={groups} labels={{ console: t('console.title'), searchNoResults: (query) => t('noResults', { query }) }} />
```

`locale` is a BCP 47 tag. The package uses it only to sort the entrance cards.

## Routing

The console works in console paths. `ConsoleProvider` takes a `router`:

```ts
interface ConsoleRouter {
  pathname: string; // the current location, as a console path
  navigate: (to: string) => void;
  Link: ConsoleLinkComponent; // renders <a href> for a console path
}
```

- With React Router 7, use `ReactRouterConsoleProvider` or `useReactRouterConsoleRouter` from
  `@berrybrands/iridium/react-router`.
- Without a router, the provider uses the History API of the browser (`useBrowserConsoleRouter`).
- If your URLs have a different form, for example `/admin?area=rooms&room=ab12`, write an adapter that gives the
  console path as `pathname` and maps each `to` back to your URL in `navigate` and `Link`.

## Slots for pages

| Hook                                | Effect                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `useRegisterConsoleSectionActions`  | Puts controls in the section header, on the row of the title                |
| `useRegisterConsoleBreadcrumbTrail` | Replaces the crumbs after the group, or adds controls at the end of the bar |
| `useRequestConsoleFullPage`         | Hides the section header and the padding, for the page of one record        |
| `useConsoleFocusMode`               | Hides all the chrome, for example for a maximised editor                    |

`SidePanel` and `FormShell` open as a column beside the content inside the shell, and as a modal outside it.

## Layout and CSS

Every class name has the form `ir-<module>-<name>`, for example `ir-shell-navItem`, and every colour comes from a
Radix token, so dark mode works with no more CSS.
The shell uses `div` elements with roles, so global styles of the host for `header` or `main` do not apply to it.

| Custom property                  | Default | Use                                                               |
| -------------------------------- | ------- | ----------------------------------------------------------------- |
| `--iridium-shell-height`         | `100%`  | The height of the shell. Set `100dvh` if no ancestor has a height |
| `--iridium-content-bottom-inset` | `0px`   | Space under the content for fixed chrome of the host              |

The mobile breakpoint is `max-width: 767px` (`MOBILE_VIEWPORT_QUERY`). The layout uses logical properties, so it
mirrors in a right-to-left document.

## Storage

The rail collapse, the favourites and the recent areas are per device, in `localStorage`, under
`<storagePrefix>.sidebarCollapsed`, `<storagePrefix>.favouriteGroups` and `<storagePrefix>.recentGroups`. The default
prefix is `console`. A refused storage call does not break the console.

## Development

```bash
npm install
npm test           # Vitest and Testing Library
npm run lint
npm run typecheck
npm run build      # dist/index.js, dist/react-router.js, dist/styles.css and the types
```

## Licence

MIT. See [LICENSE](LICENSE).
