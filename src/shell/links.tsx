import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { isActivePath } from '../router.js';

/** The props of {@link ConsoleLink}. */
export interface ConsoleLinkElementProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** A console path. */
  to?: string;
  /** A URL outside the console, opened with a full page load. It has priority over `to`. */
  href?: string;
}

/**
 * A link through the router of the provider, or a plain anchor for a URL outside the console.
 *
 * @param props - See {@link ConsoleLinkElementProps}.
 */
export const ConsoleLink = forwardRef<HTMLAnchorElement, ConsoleLinkElementProps>(function ConsoleLink({ to, href, ...props }, ref) {
  const { router } = useConsoleConfig();

  if (href != null || to == null) return <a ref={ref} href={href} {...props} />;

  return <router.Link ref={ref} to={to} {...props} />;
});

/** The props of {@link ConsoleNavLink}. */
export interface ConsoleNavLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  /** Marks the link active only on its exact path. Else a path below it also counts. */
  end?: boolean;
  /** Overrides the match on the path, for a link that stands for a page with a different path. */
  active?: boolean;
}

/**
 * A link that sets `aria-current="page"` while its path is the current location, so the active style needs no state.
 *
 * @param props - See {@link ConsoleNavLinkProps}.
 */
export const ConsoleNavLink = forwardRef<HTMLAnchorElement, ConsoleNavLinkProps>(function ConsoleNavLink(
  { to, end = false, active: activeOverride, ...props },
  ref,
) {
  const { router } = useConsoleConfig();
  const active = activeOverride ?? isActivePath(router.pathname, to, end);

  return <router.Link ref={ref} to={to} aria-current={active ? 'page' : undefined} {...props} />;
});
