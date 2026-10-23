import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { ArrowLeftIcon, Cross2Icon, DoubleArrowLeftIcon, DoubleArrowRightIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { englishConsoleLabels } from './labels.js';
import { useBrowserConsoleRouter, type ConsoleRouter } from './router.js';
import type { ConsoleGroup, ConsoleIcons, ConsoleLabels, ConsoleSearchSource } from './types.js';

/** The configuration that every part of the console reads. */
export interface ConsoleConfig {
  /** The path of the entrance page, without a trailing slash. */
  basePath: string;
  /** The groups that the viewer can open, in the order of the search. */
  groups: readonly ConsoleGroup[];
  labels: ConsoleLabels;
  icons: ConsoleIcons;
  /** The prefix of the `localStorage` keys: `<prefix>.sidebarCollapsed`, `<prefix>.favouriteGroups`, `<prefix>.recentGroups`. */
  storagePrefix: string;
  /** The locale that sorts the entrance cards. Without it, the locale of the browser. */
  locale?: string;
  /** How the console reads and changes the location. */
  router: ConsoleRouter;
  /** More results for the header search, after the groups, sections and tabs. */
  searchSource?: ConsoleSearchSource;
}

/** The props of {@link ConsoleProvider}. Every field but `groups` has a default. */
export interface ConsoleProviderProps {
  /** The path of the entrance page. The default is `/console`. */
  basePath?: string;
  groups: readonly ConsoleGroup[];
  /** The strings of the shell. Missing strings come from {@link englishConsoleLabels}. */
  labels?: Partial<ConsoleLabels>;
  /** The icons of the shell. Missing icons come from `@radix-ui/react-icons`. */
  icons?: Partial<ConsoleIcons>;
  /** The default is `console`. */
  storagePrefix?: string;
  /** A BCP 47 tag. The console uses it only for `Intl` collation. */
  locale?: string;
  /**
   * How the console reads and changes the location. Without it, the console uses the History API of the browser. With
   * React Router, use `ReactRouterConsoleProvider` from `@berrybrands/iridium/react-router`.
   */
  router?: ConsoleRouter;
  /** More results for the header search, for example records that the host finds by a key. Memoise it. */
  searchSource?: ConsoleSearchSource;
  children: ReactNode;
}

const DEFAULT_ICONS: ConsoleIcons = {
  menu: <HamburgerMenuIcon width={18} height={18} />,
  close: <Cross2Icon width={16} height={16} />,
  back: <ArrowLeftIcon />,
  collapse: <DoubleArrowLeftIcon />,
  expand: <DoubleArrowRightIcon />,
};

const ConfigContext = createContext<ConsoleConfig | null>(null);

/**
 * Gives the groups, the strings, the icons, the router and the base path to the console components below it. Put it
 * above the routes of the console, so the entrance page and the group pages share it.
 *
 * The provider does not render a Radix `Theme`. The host renders one above it, with its own appearance and accent.
 *
 * @param props - See {@link ConsoleProviderProps}.
 */
export function ConsoleProvider({
  basePath = '/console',
  groups,
  labels,
  icons,
  storagePrefix = 'console',
  locale,
  router,
  searchSource,
  children,
}: ConsoleProviderProps) {
  // The hook runs on every render, so the order of the hooks stays the same when a host adds a router later.
  const browserRouter = useBrowserConsoleRouter();
  const activeRouter = router ?? browserRouter;
  const value = useMemo<ConsoleConfig>(
    () => ({
      basePath: basePath.replace(/\/+$/, ''),
      groups,
      labels: { ...englishConsoleLabels, ...labels },
      icons: { ...DEFAULT_ICONS, ...icons },
      storagePrefix,
      locale,
      router: activeRouter,
      searchSource,
    }),
    [basePath, groups, labels, icons, storagePrefix, locale, activeRouter, searchSource],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

/**
 * The configuration of the nearest {@link ConsoleProvider}.
 *
 * @returns The configuration.
 * @throws When no provider is above the caller.
 */
export function useConsoleConfig(): ConsoleConfig {
  const config = useContext(ConfigContext);

  if (!config) throw new Error('A console component must render inside <ConsoleProvider>.');

  return config;
}

/**
 * The configuration of the nearest {@link ConsoleProvider}, or null outside one. A primitive that also works outside
 * the console, for example a side panel, uses it for its defaults.
 *
 * @returns The configuration, or null.
 */
export function useOptionalConsoleConfig(): ConsoleConfig | null {
  return useContext(ConfigContext);
}
