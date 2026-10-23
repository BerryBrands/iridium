import type { ReactNode } from 'react';
import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { SidePanel } from './SidePanel.js';

/** How a form shows. */
export type FormShellVariant = 'dialog' | 'sidebar';

/** The props of {@link FormShell}. */
export interface FormShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** A sentence under the title. */
  description?: string;
  /** The error line under the fields, or null. */
  error: string | null;
  submitting: boolean;
  onSubmit: () => void | Promise<void>;
  submitLabel: string;
  cancelLabel: string;
  /** The accessible name of the close button on a phone. The default is the `close` label of the provider. */
  closeLabel?: string;
  /** The leading footer slot, opposite Cancel and Save: the place for a destructive action on the record. */
  footerStart?: ReactNode;
  /** Locks both footer buttons while something else in the form is in flight. */
  busy?: boolean;
  /** `dialog` (the default) is a centred modal. `sidebar` is a column beside the content, in the side panel slot. */
  variant?: FormShellVariant;
  children: ReactNode;
}

/**
 * The chrome of a create or edit form: the title, a scrollable body, an error line, and Cancel and Submit buttons
 * with a loading state.
 *
 * A create form is a `dialog`, because nothing on the page anchors it. An edit form is a `sidebar`: the table keeps
 * its place, and a click on another row replaces the panel. Without a slot, the sidebar shows as a modal.
 *
 * @param props - See {@link FormShellProps}.
 */
export function FormShell({
  variant = 'dialog',
  open,
  onOpenChange,
  title,
  description,
  error,
  submitting,
  onSubmit,
  submitLabel,
  cancelLabel,
  closeLabel,
  footerStart,
  busy = false,
  children,
}: FormShellProps) {
  const footer = (
    <Flex gap="3" justify="between" align="center">
      <Box>{footerStart}</Box>
      <Flex gap="3" justify="end">
        <Button variant="soft" color="gray" disabled={busy} onClick={() => onOpenChange(false)} style={{ cursor: 'pointer' }}>
          {cancelLabel}
        </Button>
        <Button onClick={() => void onSubmit()} loading={submitting} disabled={busy} style={{ cursor: 'pointer' }}>
          {submitLabel}
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={footer}
      closeLabel={closeLabel}
      forceDialog={variant !== 'sidebar'}
    >
      <Flex direction="column" gap="3" mt="2">
        {children}
        {error && (
          <Text size="2" color="red">
            {error}
          </Text>
        )}
      </Flex>
    </SidePanel>
  );
}
