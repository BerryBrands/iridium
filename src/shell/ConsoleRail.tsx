import { useEffect, useRef, type MouseEventHandler, type ReactNode } from 'react';
import { IconButton } from '@radix-ui/themes';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { useConsoleSidebar } from '../state/preferences.js';
import { useIsMobileViewport } from '../state/useIsMobileViewport.js';
import { CONSOLE_GROUP_NAV_ID, useConsoleNavDrawer } from '../state/slots.js';
import type { ConsoleGroup } from '../types.js';
import { ConsoleLink, ConsoleNavLink } from './links.js';
import s from './shell.module.css';

/** The props of {@link ConsoleRail}. */
export interface ConsoleRailProps {
  /** The group that the rail belongs to. Its icon, accent and label head the rail. */
  group: Pick<ConsoleGroup, 'label' | 'icon' | 'accent'>;
  /** Controls at the bottom of the rail. They stay in view when the links scroll. */
  footer?: ReactNode;
  /** The links of the rail: {@link ConsoleRailSection}, {@link ConsoleRailLink} and {@link ConsoleRailSubLink}. */
  children?: ReactNode;
}

/**
 * The navigation rail of a console group: the group header and the links that the caller gives.
 *
 * The default section tree and a custom group navigation both render in this rail, so they share the desktop
 * collapse, the phone drawer and the focus rules. A collapse hides the rail fully. The element stays mounted at zero
 * width, so the change can animate, and `visibility` takes it out of the tab order.
 *
 * Below the mobile breakpoint the same element is an off-canvas drawer. The menu button in the header opens it, and
 * it starts with a link back to the entrance page. A navigation, the Escape key, the scrim, the close button or a
 * resize to desktop width closes it.
 *
 * @param props - See {@link ConsoleRailProps}.
 */
export function ConsoleRail({ group, footer, children }: ConsoleRailProps) {
  const { basePath, labels, icons, router } = useConsoleConfig();
  const { collapsed } = useConsoleSidebar();
  const { open: drawerOpen, close: closeDrawer, toggleRef } = useConsoleNavDrawer();
  const isMobile = useIsMobileViewport();
  const { pathname } = router;
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const shown = isMobile && drawerOpen;

  // A navigation, for example from the header search, shows a new page, and the page must then be visible.
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  // The drawer is a mobile control only. It must not stay open behind the desktop rail.
  useEffect(() => {
    if (!isMobile) closeDrawer();
  }, [isMobile, closeDrawer]);

  useEffect(() => {
    if (!shown) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shown, closeDrawer]);

  // Focus moves into the drawer when it opens, and back to the menu button when it closes.
  useEffect(() => {
    if (shown) closeRef.current?.focus();
    else if (wasOpen.current) toggleRef.current?.focus();

    wasOpen.current = shown;
  }, [shown, toggleRef]);

  return (
    <>
      <nav
        id={CONSOLE_GROUP_NAV_ID}
        className={s.sectionNav}
        data-collapsed={(!isMobile && collapsed) || undefined}
        data-drawer-open={shown || undefined}
        aria-label={group.label}
      >
        {/* A fixed-width inner box: the rail clips as it closes, and its labels do not reflow on each frame. */}
        <div className={s.sectionNavInner} data-footer={footer != null || undefined}>
          <div className={s.sectionNavHeader}>
            <span className={s.groupIcon} data-ir-accent={group.accent}>
              {group.icon}
            </span>
            <span className={s.sectionNavTitle}>{group.label}</span>
            {isMobile && (
              <IconButton
                ref={closeRef}
                variant="ghost"
                color="gray"
                size="3"
                className={s.drawerClose}
                onClick={closeDrawer}
                aria-label={labels.close}
              >
                {icons.close}
              </IconButton>
            )}
          </div>

          {isMobile && (
            <ConsoleLink to={basePath} className={s.navItem} data-drawer-home onClick={closeDrawer}>
              <span className={`${s.navIcon} ${s.mirror}`}>{icons.back}</span>
              <span className={s.navItemLabel}>{labels.allAreas}</span>
            </ConsoleLink>
          )}

          {children}

          {footer != null && <div className={s.sectionNavFooter}>{footer}</div>}
        </div>
      </nav>

      {/* The scrim closes the drawer on a tap outside it. The close button is the accessible control. */}
      {shown && <div className={s.drawerScrim} onClick={closeDrawer} aria-hidden="true" data-testid="console-drawer-scrim" />}
    </>
  );
}

/**
 * A page of the rail and its sub-pages. The page is a {@link ConsoleRailLink}, and the sub-pages are
 * {@link ConsoleRailSubLink} elements under it.
 *
 * @param props - The children.
 */
export function ConsoleRailSection({ children }: { children: ReactNode }) {
  return <div className={s.navSection}>{children}</div>;
}

/** The props of {@link ConsoleRailLink}. */
export interface ConsoleRailLinkProps {
  to: string;
  icon: ReactNode;
  label: ReactNode;
  /** Marks the link active only on its exact path. Set it for a page without sub-pages. */
  end?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/**
 * A primary link of the rail, with an icon. A click also closes the phone drawer, because a lazy page can delay the
 * new pathname.
 *
 * @param props - See {@link ConsoleRailLinkProps}.
 */
export function ConsoleRailLink({ to, icon, label, end, onClick }: ConsoleRailLinkProps) {
  const { close } = useConsoleNavDrawer();

  return (
    <ConsoleNavLink
      to={to}
      end={end}
      className={s.navItem}
      onClick={(event) => {
        close();
        onClick?.(event);
      }}
    >
      <span className={s.navIcon}>{icon}</span>
      <span className={s.navItemLabel}>{label}</span>
    </ConsoleNavLink>
  );
}

/**
 * A secondary link of the rail, under its page: indented, quieter and smaller, so the tree reads as two levels.
 *
 * @param props - The path, the label and an optional click handler.
 */
export function ConsoleRailSubLink({
  to,
  label,
  onClick,
}: {
  to: string;
  label: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const { close } = useConsoleNavDrawer();

  return (
    <ConsoleNavLink
      to={to}
      end
      className={s.navSubItem}
      onClick={(event) => {
        close();
        onClick?.(event);
      }}
    >
      {label}
    </ConsoleNavLink>
  );
}

/**
 * A small uppercase caption between groups of rail links.
 *
 * @param props - The caption.
 */
export function ConsoleRailLabel({ children }: { children: ReactNode }) {
  return <div className={s.sectionNavLabel}>{children}</div>;
}
