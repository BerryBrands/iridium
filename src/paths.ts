import type { ConsoleGroup, ConsoleSection, ConsoleTab } from './types.js';

/**
 * The path of a group.
 *
 * @param basePath - The base path of the console.
 * @param group - The group.
 * @returns `<basePath>/<group>`.
 */
export function groupPath(basePath: string, group: Pick<ConsoleGroup, 'slug'>): string {
  return `${basePath}/${group.slug}`;
}

/**
 * The path of a section, or of one of its tabs. The first tab is the default, so its path is the section path.
 *
 * @param basePath - The base path of the console.
 * @param group - The group of the section.
 * @param section - The section.
 * @param tab - A tab of the section, or `undefined` for the section itself.
 * @returns `<basePath>/<group>/<section>` or `<basePath>/<group>/<section>/<tab>`.
 */
export function sectionPath(
  basePath: string,
  group: Pick<ConsoleGroup, 'slug'>,
  section: { slug: string; tabs?: readonly Pick<ConsoleTab, 'id'>[] },
  tab?: Pick<ConsoleTab, 'id' | 'slug'>,
): string {
  const path = `${basePath}/${group.slug}/${section.slug}`;

  return tab == null || section.tabs?.[0]?.id === tab.id ? path : `${path}/${tab.slug}`;
}

/**
 * Whether a pathname is the page of a group or a page inside it.
 *
 * @param pathname - The pathname to test.
 * @param basePath - The base path of the console.
 * @param group - The group.
 */
export function isInGroup(pathname: string, basePath: string, group: Pick<ConsoleGroup, 'slug'>): boolean {
  const root = groupPath(basePath, group);

  return pathname === root || pathname.startsWith(`${root}/`);
}

/**
 * Converts a camel-case id to a kebab-case path segment: `sheetsIntegration` gives `sheets-integration`.
 *
 * @param id - The id.
 */
export function toSlug(id: string): string {
  return id.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Finds a group by its path segment.
 *
 * @param groups - The groups to search.
 * @param slug - The path segment, or `undefined`.
 */
export function findGroupBySlug<G extends Pick<ConsoleGroup, 'slug'>>(groups: readonly G[], slug: string | undefined): G | undefined {
  return slug == null ? undefined : groups.find((group) => group.slug === slug);
}

/**
 * Finds a section of a group by its path segment.
 *
 * @param group - The group to search.
 * @param slug - The path segment, or `undefined`.
 */
export function findSectionBySlug(group: Pick<ConsoleGroup, 'sections'>, slug: string | undefined): ConsoleSection | undefined {
  return slug == null ? undefined : group.sections.find((section) => section.slug === slug);
}
