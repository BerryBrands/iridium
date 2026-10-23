import { useEffect, type FocusEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Box, Dialog, Flex, Heading, IconButton, Separator, Text, VisuallyHidden } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useOptionalConsoleConfig } from '../ConsoleProvider.js';
import { useConsoleSidePanelHost } from '../state/slots.js';
import { useIsMobileViewport } from '../state/useIsMobileViewport.js';
import s from './panel.module.css';

/** The props of {@link SidePanel}. */
export interface SidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Names the panel for assistive technology, and heads it unless `header` replaces it. */
  title: string;
  description?: ReactNode;
  /** Replaces the default heading, for a panel that starts with something richer. */
  header?: ReactNode;
  /** Controls before the close button, for example a copy-link button or a menu. */
  actions?: ReactNode;
  /** Pinned to the foot, under a separator. */
  footer?: ReactNode;
  /** Widens the column for content that a form column cannot hold. */
  wide?: boolean;
  /** The width of the modal fallback. */
  dialogMaxWidth?: string;
  /** Stays a centred modal even where the slot exists. */
  forceDialog?: boolean;
  /** The accessible name of the close button. The default is the `close` label of the provider. */
  closeLabel?: string;
  children: ReactNode;
}

/**
 * Stops the first field of a dialog from taking the focus on a phone, because the on-screen keyboard would then cover
 * the dialog.
 */
function suppressMobileAutoFocus(event: Event | FocusEvent) {
  if (typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches) event.preventDefault();
}

/**
 * A panel in the side panel slot of the console, with a centred modal as the fallback where the slot does not exist:
 * outside the shell, or under test.
 *
 * Below the mobile breakpoint the panel covers the screen and shows its own close button, because a phone has no
 * Escape key. On a wider screen, a panel without a footer shows the close button next to its heading.
 *
 * @param props - See {@link SidePanelProps}.
 */
export function SidePanel({
  open,
  onOpenChange,
  title,
  description,
  header,
  actions,
  footer,
  wide = false,
  dialogMaxWidth = '560px',
  forceDialog = false,
  closeLabel,
  children,
}: SidePanelProps) {
  const config = useOptionalConsoleConfig();
  const host = useConsoleSidePanelHost();
  const isMobile = useIsMobileViewport();
  const asSidebar = host != null && !forceDialog;

  // The panel is not modal, so nothing catches the Escape key for it.
  useEffect(() => {
    if (!asSidebar || !open) return;

    // A Radix layer in the panel (an open select, a menu or a dialog) handles Escape first and marks the event.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) onOpenChange(false);
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [asSidebar, open, onOpenChange]);

  if (asSidebar) {
    if (!open) return null;

    const closeButton = (
      <IconButton
        variant="ghost"
        color="gray"
        size={isMobile ? '3' : '2'}
        className={s.sidePanelClose}
        onClick={() => onOpenChange(false)}
        aria-label={closeLabel ?? config?.labels.close ?? 'Close'}
      >
        {config?.icons.close ?? <Cross2Icon width={16} height={16} />}
      </IconButton>
    );
    const controls = actions ? (
      <Flex align="center" gap="3" flexShrink="0">
        {actions}
        {closeButton}
      </Flex>
    ) : (
      closeButton
    );
    const heading = header ?? (
      <Heading size="4" mb={description ? '1' : '2'}>
        {title}
      </Heading>
    );

    return createPortal(
      <aside className={s.sidePanel} data-wide={wide || undefined} aria-label={title}>
        <div className={s.sidePanelInner}>
          {isMobile && (
            <Flex justify="end" className={s.sidePanelBar}>
              {controls}
            </Flex>
          )}
          {!isMobile && !footer ? (
            <Flex align="start" justify="between" gap="3">
              {heading}
              {controls}
            </Flex>
          ) : (
            heading
          )}
          {description && (
            <Text size="2" color="gray" as="p" mb="2">
              {description}
            </Text>
          )}
          <Box className={s.sidePanelBody} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {children}
          </Box>
          {footer && (
            <>
              <Separator size="4" my="3" />
              {footer}
            </>
          )}
        </div>
      </aside>,
      host,
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        maxWidth={dialogMaxWidth}
        onOpenAutoFocus={suppressMobileAutoFocus}
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}
      >
        {header ? (
          <>
            {/* Radix needs a title for the accessible name of the dialog, also when the visible header is richer. */}
            <VisuallyHidden>
              <Dialog.Title>{title}</Dialog.Title>
            </VisuallyHidden>
            {actions ? (
              <Flex align="start" justify="between" gap="3">
                {header}
                <Flex align="center" gap="3" flexShrink="0">
                  {actions}
                </Flex>
              </Flex>
            ) : (
              header
            )}
          </>
        ) : (
          <Dialog.Title mb={description ? '1' : undefined}>{title}</Dialog.Title>
        )}
        {description && !header && (
          <Dialog.Description size="2" color="gray">
            {description}
          </Dialog.Description>
        )}
        <Box style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>{children}</Box>
        {footer && (
          <>
            <Separator size="4" my="3" />
            {footer}
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
