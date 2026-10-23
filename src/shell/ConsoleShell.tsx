import { useEffect, type ReactNode } from 'react';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { isInGroup } from '../paths.js';
import { useConsoleRecentGroups } from '../state/preferences.js';
import {
  ConsoleBreadcrumbTrailProvider,
  ConsoleFocusModeProvider,
  ConsoleFullPageProvider,
  ConsoleNavDrawerProvider,
  ConsoleSectionActionsProvider,
  ConsoleSidePanelProvider,
  useConsoleFocusMode,
} from '../state/slots.js';
import { useIsMobileViewport } from '../state/useIsMobileViewport.js';
import type { ConsoleGroup, ConsoleSection } from '../types.js';
import { ConsoleBreadcrumbBar } from './ConsoleBreadcrumbBar.js';
import { ConsoleGroupView } from './ConsoleGroupView.js';
import { ConsoleMenuButton } from './ConsoleMenuButton.js';
import { ConsoleRecentBar } from './ConsoleRecentBar.js';
import { ConsoleSearch } from './ConsoleSearch.js';
import { ConsoleSwitcher } from './ConsoleSwitcher.js';
import { ConsoleLink } from './links.js';
import s from './shell.module.css';

/** The props of {@link ConsoleShell}. */
export interface ConsoleShellProps {
  /** The open group, or `undefined` at the entrance page. A group with an `href` never opens. */
  group?: ConsoleGroup;
  /** The open section of the group, or `undefined` at the page of the group. */
  section?: ConsoleSection;
  /** The mark at the start of the header. It links to the entrance page. */
  logo: ReactNode;
  /** Controls at the end of the header, for example the user menu. */
  headerEnd?: ReactNode;
  /** The entrance page, shown when no group is open. Usually a {@link ConsoleHome}. */
  home?: ReactNode;
  /** The loading state of a lazy page. */
  fallback?: ReactNode;
  /**
   * The row of area chips under the header: `recent` (the default) for the areas visited most recently, `all` for every
   * group, `none` for no row.
   */
  areaBar?: 'recent' | 'all' | 'none';
  /** Turns the Option+Tab area switcher on or off. The default is on. */
  switcher?: boolean;
  /** Content inside the providers of the shell but outside its layout, for example a modal of the host. */
  extras?: ReactNode;
  /**
   * The content pane of the open group, in place of its section or its landing page. See
   * {@link ConsoleGroupViewProps.content}.
   */
  children?: ReactNode;
}

/**
 * The console layout: the header with the logo, the search and the end controls; the recent bar; the Option+Tab
 * switcher; the breadcrumb bar; and the body with the rail, the page and the side panel slot.
 *
 * The host resolves the group and the section from its routes and gives them here. The shell records each visit of a
 * group for the recent bar and the switcher. It also gives the slots for section actions, the breadcrumb trail, the
 * full page, the side panel and the focus mode to the pages inside it.
 *
 * @param props - See {@link ConsoleShellProps}.
 */
export function ConsoleShell(props: ConsoleShellProps) {
  return (
    <ConsoleSectionActionsProvider>
      <ConsoleFullPageProvider>
        <ConsoleBreadcrumbTrailProvider>
          <ConsoleSidePanelProvider>
            <ConsoleNavDrawerProvider>
              <ConsoleFocusModeProvider>
                {props.extras}
                <ShellLayout {...props} />
              </ConsoleFocusModeProvider>
            </ConsoleNavDrawerProvider>
          </ConsoleSidePanelProvider>
        </ConsoleBreadcrumbTrailProvider>
      </ConsoleFullPageProvider>
    </ConsoleSectionActionsProvider>
  );
}

function ShellLayout({
  group: requested,
  section,
  logo,
  headerEnd,
  home,
  fallback,
  areaBar = 'recent',
  switcher = true,
  children,
}: ConsoleShellProps) {
  const { basePath, labels, router } = useConsoleConfig();
  const group = requested?.href == null ? requested : undefined;
  const { focused } = useConsoleFocusMode();
  const { remember } = useConsoleRecentGroups();
  const { pathname } = router;
  const isMobile = useIsMobileViewport();

  // The recent bar files the page under its area. The pathname only: a stored query string could open a modal again
  // on arrival.
  useEffect(() => {
    if (group && isInGroup(pathname, basePath, group)) remember(group.id, pathname);
  }, [group, pathname, basePath, remember]);

  return (
    // A page can turn on the focus mode. The layout then hides its chrome, so the page fills the window.
    <div className={s.layout} data-console-shell data-focus={focused || undefined}>
      <div role="banner" className={s.header}>
        {/* On a phone the header is the only row of chrome, so a group page shows the menu button in place of the logo. */}
        {isMobile && group ? (
          <ConsoleMenuButton />
        ) : (
          <ConsoleLink to={basePath} className={s.headerHome} aria-label={labels.console}>
            {logo}
          </ConsoleLink>
        )}

        <div className={s.headerSearch}>
          <ConsoleSearch />
        </div>

        {headerEnd != null && <div className={s.headerEnd}>{headerEnd}</div>}
      </div>

      {/* Above the crumbs: where you were, then where you are. A phone shows neither row; the drawer has the navigation. */}
      {!isMobile && areaBar !== 'none' && <ConsoleRecentBar mode={areaBar} switchHint={switcher} />}

      {switcher && <ConsoleSwitcher />}

      {group && !isMobile && <ConsoleBreadcrumbBar group={group} section={section} />}

      <div className={s.body}>
        {group ? (
          <ConsoleGroupView group={group} section={section} fallback={fallback} content={children} />
        ) : (
          <div role="main" className={s.content}>
            {home}
          </div>
        )}
      </div>
    </div>
  );
}
