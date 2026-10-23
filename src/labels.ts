import type { ConsoleLabels } from './types.js';

/** English strings for the shell, for a host that has no translations yet or that replaces only some of them. */
export const englishConsoleLabels: ConsoleLabels = {
  console: 'Console',
  close: 'Close',
  allAreas: 'All areas',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  expandSidebar: 'Expand sidebar',
  collapseSidebar: 'Collapse sidebar',
  breadcrumbs: 'Breadcrumbs',
  searchPlaceholder: 'Search the console',
  searchResults: 'Search results',
  searchNoResults: (query) => `Nothing matches “${query}”`,
  recent: 'Recent areas',
  switchHint: 'to switch',
  switcher: 'Switch area',
  addFavourite: 'Add to favourites',
  removeFavourite: 'Remove from favourites',
  favourites: 'Favourites',
};
