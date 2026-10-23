import { Suspense, type ReactNode } from 'react';
import { Flex, Heading, Spinner, Text } from '@radix-ui/themes';
import { useConsoleConfig } from '../ConsoleProvider.js';
import { sectionPath } from '../paths.js';
import { ConsoleSectionActionsOutlet, ConsoleSidePanelSlot, useConsoleFullPage } from '../state/slots.js';
import type { ConsoleGroup, ConsoleSection } from '../types.js';
import { ConsoleRail, ConsoleRailLink, ConsoleRailSection, ConsoleRailSubLink } from './ConsoleRail.js';
import s from './shell.module.css';

/**
 * The loading state of a page. It covers the content pane only, so the header and the rail stay while a lazy page
 * loads.
 */
function PanelFallback() {
  return (
    <Flex align="center" justify="center" style={{ minHeight: 240 }}>
      <Spinner role="status" />
    </Flex>
  );
}

/**
 * The default navigation of a group: each section is a primary link, and its tabs are secondary links under it. All
 * sections stay expanded, so the whole group is one click away.
 *
 * @param props - The group.
 */
export function ConsoleGroupNav({ group }: { group: ConsoleGroup }) {
  const { basePath } = useConsoleConfig();

  return (
    <ConsoleRail group={group}>
      {group.sections.map((section) => {
        const tabs = (section.tabs ?? []).filter((tab) => !tab.hidden);

        return (
          <ConsoleRailSection key={section.id}>
            <ConsoleRailLink to={sectionPath(basePath, group, section)} end={tabs.length === 0} icon={section.icon} label={section.label} />
            {tabs.map((tab) => (
              <ConsoleRailSubLink key={tab.id} to={sectionPath(basePath, group, section, tab)} label={tab.label} />
            ))}
          </ConsoleRailSection>
        );
      })}
    </ConsoleRail>
  );
}

/** The props of {@link ConsoleGroupView}. */
export interface ConsoleGroupViewProps {
  group: ConsoleGroup;
  /** The open section, or `undefined` at the page of the group itself. */
  section: ConsoleSection | undefined;
  /** The loading state of a lazy page. The default is a spinner. */
  fallback?: ReactNode;
  /**
   * Content for the content pane in place of the section or the landing page, for a group whose pages are not
   * sections, for example records that a custom navigation lists. The rail, the breadcrumbs and the side panel slot
   * stay.
   */
  content?: ReactNode;
}

/**
 * A console group: its rail, the open section with its header, and the side panel slot.
 *
 * @param props - See {@link ConsoleGroupViewProps}.
 */
export function ConsoleGroupView({ group, section, fallback = <PanelFallback />, content }: ConsoleGroupViewProps) {
  const Landing = group.landing;
  const Panel = section?.component;
  const CustomNav = group.nav;
  const fullPage = useConsoleFullPage();

  return (
    <>
      {/* Until the chunk of a custom navigation arrives, the rail shows the group header only, so the content does not move. */}
      {CustomNav ? (
        <Suspense fallback={<ConsoleRail group={group} />}>
          <CustomNav group={group} section={section} />
        </Suspense>
      ) : (
        <ConsoleGroupNav group={group} />
      )}

      <div
        role="main"
        className={s.content}
        data-fill-content={(content == null && section?.fillContent) || fullPage || undefined}
        data-full-page={fullPage || undefined}
      >
        {content != null ? (
          <Suspense fallback={fallback}>{content}</Suspense>
        ) : section ? (
          <>
            <div className={s.sectionHeader} data-console-section-header hidden={fullPage || undefined}>
              <div>
                <Heading size="5" mb={section.description ? '1' : undefined}>
                  {section.title ?? section.label}
                </Heading>
                {section.description && (
                  <Text size="2" color="gray" as="p">
                    {section.description}
                  </Text>
                )}
              </div>
              <div className={s.sectionHeaderActions}>
                <ConsoleSectionActionsOutlet />
              </div>
            </div>

            {section.fillContent ? (
              <div className={s.sectionPanel}>
                <Suspense fallback={fallback}>{Panel && <Panel />}</Suspense>
              </div>
            ) : (
              <Suspense fallback={fallback}>{Panel && <Panel />}</Suspense>
            )}
          </>
        ) : (
          Landing && (
            <Suspense fallback={fallback}>
              <Landing />
            </Suspense>
          )
        )}
      </div>

      {/* Editors open here, opposite the rail, so the content pane gives up the width and is not covered. */}
      <ConsoleSidePanelSlot />
    </>
  );
}
