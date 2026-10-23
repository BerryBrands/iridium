import {
  forwardRef,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ForwardRefExoticComponent,
  type MouseEvent,
  type RefAttributes,
} from 'react';

/** The props of the link component of a {@link ConsoleRouter}. */
export interface ConsoleLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** A console path, `<basePath>/<group>/<section>/<tab>`, with an optional query string. */
  to: string;
}

/** A link component that forwards its ref to the anchor. */
export type ConsoleLinkComponent = ForwardRefExoticComponent<ConsoleLinkProps & RefAttributes<HTMLAnchorElement>>;

/**
 * How the console reads and changes the location of the host. The console works in console paths:
 * `<basePath>/<group>/<section>/<tab>`. A host with a different URL form, for example query parameters on one page,
 * maps between the two forms in its adapter.
 */
export interface ConsoleRouter {
  /** The current location, as a console path without a query string. */
  pathname: string;
  /** Goes to a console path. */
  navigate: (to: string) => void;
  /** Renders a link to a console path. It must set the `href` that the browser opens in a new tab. */
  Link: ConsoleLinkComponent;
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('popstate', listener);

  return () => window.removeEventListener('popstate', listener);
}

function currentPathname(): string {
  return window.location.pathname;
}

function pushPath(to: string) {
  window.history.pushState(null, '', to);
  // `pushState` fires no event, so the readers of the location hear of the change from a synthetic `popstate`.
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Whether a click must stay with the browser: a modified click, a middle click or a link to a new tab.
 *
 * @param event - The click.
 */
function isBrowserClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || event.currentTarget.target === '_blank';
}

const BrowserLink: ConsoleLinkComponent = forwardRef<HTMLAnchorElement, ConsoleLinkProps>(function BrowserLink(
  { to, onClick, ...props },
  ref,
) {
  return (
    <a
      ref={ref}
      href={to}
      {...props}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || isBrowserClick(event)) return;

        event.preventDefault();
        pushPath(to);
      }}
    />
  );
});

/**
 * A {@link ConsoleRouter} on the History API of the browser, for a host without a router. The console paths are the
 * real paths of the page. The provider uses it when the host gives no router.
 *
 * @returns The router.
 */
export function useBrowserConsoleRouter(): ConsoleRouter {
  const pathname = useSyncExternalStore(subscribe, currentPathname, () => '/');
  const navigate = useCallback((to: string) => pushPath(to), []);

  return useMemo(() => ({ pathname, navigate, Link: BrowserLink }), [pathname, navigate]);
}

/**
 * Whether a link to `to` is the current page.
 *
 * @param pathname - The current console path.
 * @param to - The path of the link, maybe with a query string.
 * @param end - True to match the exact path only. Else a path below `to` also matches.
 */
export function isActivePath(pathname: string, to: string, end: boolean): boolean {
  const path = to.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const current = pathname.replace(/\/+$/, '') || '/';

  return current === path || (!end && current.startsWith(`${path}/`));
}
