import { forwardRef, useMemo, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ConsoleProvider, type ConsoleProviderProps } from './ConsoleProvider.js';
import type { ConsoleLinkComponent, ConsoleLinkProps, ConsoleRouter } from './router.js';

const RouterLink: ConsoleLinkComponent = forwardRef<HTMLAnchorElement, ConsoleLinkProps>(function RouterLink(props, ref) {
  return <Link ref={ref} {...props} />;
});

/**
 * A {@link ConsoleRouter} on React Router 7. Call it under the router of the host.
 *
 * @returns The router.
 */
export function useReactRouterConsoleRouter(): ConsoleRouter {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return useMemo(() => ({ pathname, navigate: (to: string) => void navigate(to), Link: RouterLink }), [pathname, navigate]);
}

/**
 * A {@link ConsoleProvider} with the router of React Router 7.
 *
 * @param props - The props of {@link ConsoleProvider}, without `router`.
 */
export function ReactRouterConsoleProvider(props: Omit<ConsoleProviderProps, 'router'> & { children: ReactNode }) {
  const router = useReactRouterConsoleRouter();

  return <ConsoleProvider {...props} router={router} />;
}
