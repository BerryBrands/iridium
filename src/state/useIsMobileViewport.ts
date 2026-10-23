import { useSyncExternalStore } from 'react';

/** The mobile breakpoint of the console, as a media query. The CSS of the package uses the same width. */
export const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};

  const media = window.matchMedia(MOBILE_VIEWPORT_QUERY);

  media.addEventListener('change', onChange);

  return () => media.removeEventListener('change', onChange);
}

function snapshot(): boolean {
  // An environment without `matchMedia`, for example jsdom, counts as a desktop.
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
}

/**
 * Whether the viewport is below the mobile breakpoint. The caller re-renders when the viewport crosses it.
 *
 * @returns `true` while the viewport matches {@link MOBILE_VIEWPORT_QUERY}.
 */
export function useIsMobileViewport(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
