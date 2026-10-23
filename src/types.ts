import type { ComponentType, ReactNode } from 'react';

/**
 * The Radix colour scales that can tint a console area. An area keeps its colour everywhere it appears: the entrance
 * card, the rail header, the recent chip and the switcher tile.
 */
export type ConsoleAccent = 'indigo' | 'cyan' | 'amber' | 'green' | 'violet' | 'blue' | 'tomato' | 'orange' | 'gray' | 'plum';

/** One sub-page of a {@link ConsoleSection}, listed under the section in the rail. */
export interface ConsoleTab {
  /** A stable id, unique in its section. */
  id: string;
  /** The path segment after the section. The first tab is the default, and its path has no segment. */
  slug: string;
  /** The label in the rail, the search and the breadcrumbs. */
  label: string;
  /** The icon in the search results. Without it, the search shows the icon of the section. */
  icon?: ReactNode;
  /** Keeps the path of the tab, for old links, but leaves it out of the rail and the search. The breadcrumbs name it. */
  hidden?: boolean;
}

/** One page of a {@link ConsoleGroup}: `<basePath>/<group>/<section>`. */
export interface ConsoleSection {
  /** A stable id, unique in the console. */
  id: string;
  /** The path segment after the group. */
  slug: string;
  /** The label in the rail and the search. */
  label: string;
  /** The heading of the page. The default is {@link label}. */
  title?: ReactNode;
  /** A sentence under the heading. */
  description?: ReactNode;
  /** The icon in the rail and the search. Pages need an icon, so that the rail reads as a list. */
  icon: ReactNode;
  /** The page. A lazy component loads on demand, under a fallback in the content pane only. */
  component?: ComponentType;
  /** Lets the page divide the height of the content pane instead of growing the page. */
  fillContent?: boolean;
  /** The sub-pages, listed under the section in the rail. */
  tabs?: readonly ConsoleTab[];
}

/** The props that a custom group navigation gets. See {@link ConsoleGroup.nav}. */
export interface ConsoleGroupNavProps {
  /** The group that the navigation belongs to. */
  group: ConsoleGroup;
  /** The open section, or `undefined` at the page of the group itself. */
  section: ConsoleSection | undefined;
}

/**
 * A console area, the unit that a person navigates to: `<basePath>/<group>`. The entrance page shows one card for each
 * group, and inside a group its sections become the rail.
 *
 * Give the console only the groups and the sections that the viewer can open. The search, the rail, the recent bar
 * and the switcher then cannot offer a page that the viewer cannot see.
 */
export interface ConsoleGroup {
  /** A stable id, unique in the console. The recent and favourite lists in storage keep it. */
  id: string;
  /** The path segment after the base path. */
  slug: string;
  /** The name of the area. */
  label: string;
  /** What the area is for, on its entrance card. */
  description?: ReactNode;
  /** The icon of the area. With the accent, it is how a person recognises the area. */
  icon: ReactNode;
  /** The colour of the area. Do not change it after release, because people learn it. */
  accent: ConsoleAccent;
  /** An optional page at `<basePath>/<group>` itself. */
  landing?: ComponentType;
  /**
   * Makes the group a link out of the console, opened with a full page load: a card on the entrance page, a chip in
   * the area bar and a search result, but never an open group. The recent list and the favourites leave it out. Give
   * it no sections.
   */
  href?: string;
  /**
   * An optional navigation that replaces the default section tree. Render its links inside {@link ConsoleRail}, so
   * the collapse, the phone drawer and the focus rules stay the same.
   */
  nav?: ComponentType<ConsoleGroupNavProps>;
  /** The pages of the area, in rail order. */
  sections: readonly ConsoleSection[];
}

/**
 * Every string that the shell shows. The host gives them, already translated, so the package has no i18n dependency.
 * Start from {@link englishConsoleLabels} and replace what you need.
 */
export interface ConsoleLabels {
  /** The name of the console: the first crumb, the entrance heading and the name of the logo link. */
  console: string;
  /** The close button of the phone drawer. */
  close: string;
  /** The link back to the entrance page at the top of the phone drawer. */
  allAreas: string;
  /** The menu button that opens the phone drawer. */
  openMenu: string;
  /** The menu button when the drawer is open. */
  closeMenu: string;
  /** The rail toggle when the rail is closed. */
  expandSidebar: string;
  /** The rail toggle when the rail is open. */
  collapseSidebar: string;
  /** The name of the breadcrumb navigation. */
  breadcrumbs: string;
  /** The placeholder and the name of the header search. */
  searchPlaceholder: string;
  /** The name of the result list of the search. */
  searchResults: string;
  /** The text when a query finds nothing. */
  searchNoResults: (query: string) => string;
  /** The name of the recent bar. */
  recent: string;
  /** The hint after the recent chips, next to the Option and Tab keys. */
  switchHint: string;
  /** The name of the Option+Tab switcher. */
  switcher: string;
  /** The star of an entrance card that is not a favourite. */
  addFavourite: string;
  /** The star of an entrance card that is a favourite. */
  removeFavourite: string;
  /** The heading of the favourite cards on the entrance page. */
  favourites: string;
}

/** The icons that the shell itself shows. Each one has a default from `@radix-ui/react-icons`. */
export interface ConsoleIcons {
  /** The menu button of the phone header. */
  menu: ReactNode;
  /** The close button of the phone drawer and of a side panel. */
  close: ReactNode;
  /** The link back to the entrance page in the phone drawer. It mirrors in a right-to-left document. */
  back: ReactNode;
  /** The rail toggle when the rail is open. It mirrors in a right-to-left document. */
  collapse: ReactNode;
  /** The rail toggle when the rail is closed. It mirrors in a right-to-left document. */
  expand: ReactNode;
}

/** One result of a {@link ConsoleSearchSource}. */
export interface ConsoleSearchResult {
  /** A key, unique in the results. */
  id: string;
  label: string;
  /** The name of the parent, on the trailing side of the result. */
  context?: string;
  icon?: ReactNode;
  /** A console path. */
  to: string;
}

/**
 * Gives more results for the header search, for example live records that the host finds by a key. It runs on each
 * change of the query, so keep it fast and synchronous.
 */
export type ConsoleSearchSource = (query: string) => readonly ConsoleSearchResult[];
