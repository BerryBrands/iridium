import { Fragment, type ReactNode } from 'react';
import { IconButton } from '@radix-ui/themes';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { groupPath, sectionPath } from '../paths.js';
import { useConsoleSidebar } from '../state/preferences.js';
import { useConsoleBreadcrumbTrail } from '../state/slots.js';
import type { ConsoleGroup, ConsoleSection } from '../types.js';
import { ConsoleLink } from './links.js';
import s from './shell.module.css';

/** One rendered crumb. The last one of a trail has no `to`. */
interface Crumb {
  key: string;
  label: ReactNode;
  to?: string;
}

/**
 * The tab segment of a pathname of the form `<basePath>/<group>/<section>/<tab>`, or `undefined` for a different form.
 *
 * @param pathname - The current pathname.
 * @param basePath - The base path of the console.
 */
function tabSegment(pathname: string, basePath: string): string | undefined {
  if (!pathname.startsWith(`${basePath}/`)) return undefined;

  const segments = pathname.slice(basePath.length + 1).split('/');

  return segments.length === 3 ? segments[2] : undefined;
}

/** The props of {@link ConsoleBreadcrumbBar}. */
export interface ConsoleBreadcrumbBarProps {
  group: ConsoleGroup;
  /** The open section, or `undefined` at the page of the group. */
  section: ConsoleSection | undefined;
}

/**
 * The strip under the header: the rail toggle, then the path back out of the current page.
 *
 * Each crumb but the last is a link to a different URL. The default tab of a section has no segment, so it gets no
 * crumb that links to the open page. A view can give the crumbs after the group and controls at the end of the bar
 * with `useRegisterConsoleBreadcrumbTrail`.
 *
 * @param props - See {@link ConsoleBreadcrumbBarProps}.
 */
export function ConsoleBreadcrumbBar({ group, section }: ConsoleBreadcrumbBarProps) {
  const { basePath, labels, icons, router } = useConsoleConfig();
  const { collapsed, toggleCollapsed } = useConsoleSidebar();
  const slug = tabSegment(router.pathname, basePath);
  const tab = section?.tabs?.find((candidate) => candidate.slug === slug);
  const trail = useConsoleBreadcrumbTrail();

  const crumbs: Crumb[] = [
    { key: 'console', label: labels.console, to: basePath },
    { key: 'group', label: group.label, to: groupPath(basePath, group) },
  ];

  if (trail?.crumbs) crumbs.push(...trail.crumbs);
  else {
    if (section) crumbs.push({ key: 'section', label: section.title ?? section.label, to: sectionPath(basePath, group, section) });

    if (section && tab) crumbs.push({ key: 'tab', label: tab.label });
  }

  // The trail ends where the viewer is, so the final crumb is text.
  const last = crumbs.length - 1;

  return (
    <div className={s.breadcrumbBar}>
      <IconButton
        variant="ghost"
        color="gray"
        size="2"
        className={s.sidebarToggle}
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        aria-label={collapsed ? labels.expandSidebar : labels.collapseSidebar}
      >
        {/* A reading-order chevron, so it points outward in a right-to-left document too. */}
        <span className={s.mirror} style={{ display: 'inline-flex' }}>
          {collapsed ? icons.expand : icons.collapse}
        </span>
      </IconButton>

      <nav className={s.breadcrumbs} aria-label={labels.breadcrumbs}>
        <ol className={s.breadcrumbList}>
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.key}>
              {index > 0 && (
                <li className={s.breadcrumbSeparator} aria-hidden="true">
                  /
                </li>
              )}
              <li className={s.breadcrumbItem} data-last={index === last || undefined}>
                {index === last || crumb.to == null ? (
                  <span aria-current="page" className={s.breadcrumbCurrent}>
                    {crumb.label}
                  </span>
                ) : (
                  <ConsoleLink to={crumb.to} className={s.breadcrumbLink}>
                    {crumb.label}
                  </ConsoleLink>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>

      {trail?.end && <div className={s.breadcrumbEnd}>{trail.end}</div>}
    </div>
  );
}
